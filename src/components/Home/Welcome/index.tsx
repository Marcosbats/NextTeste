import styles from  './styles.module.scss'
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useHuddle01 } from '@huddle01/react';
import { Video, Audio } from '@huddle01/react/components';
import { useLobby, useAudio, useVideo, useRoom, usePeers, useAcl, useEventListener, useRecording} from '@huddle01/react/hooks';
import { Divide as Hamburger } from 'hamburger-react'
import { LuUsers, LuUser } from "react-icons/lu";
import { HiOutlineVideoCamera, HiOutlineVideoCameraSlash} from "react-icons/hi2";
import { BsMic, BsMicMute,  BsTelephoneX, BsX, BsFillCameraVideoOffFill } from "react-icons/bs";
import { IoLogIn } from "react-icons/io5";
import { RiSpeakFill } from "react-icons/ri";
import { Loading } from '../../Genericos/Loading'
import { createRoom } from '../../../pages/api/roomId';
import { createToken } from '../../../pages/api/tokenRoom';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import { ModalEndRoom } from '../../Genericos/ModalEndRoom';
import initializeFirebaseClient from '../../../services/firebaseConnection'
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Carrossel } from '../../Carroussel';

  //Hamburguer
  interface NavbarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
  }

  const Navbar: React.FC<NavbarProps> = ({ isOpen, toggleSidebar }) => {
    const navbarClassName = isOpen ? 'navbar' : 'navbar hidden';

    return(
      <div className={styles.navbarClassName}>
      <Hamburger toggled={isOpen}
      size={parseInt("25")} rounded toggle={toggleSidebar} />
      </div>   
    )
  }

export function Welcome(){ 
  const { initialize, roomState } = useHuddle01();
  const { joinLobby } = useLobby(); 
  const { joinRoom } = useRoom(); 
  const { peers } = usePeers();
  const { changePeerRole, kickPeer } = useAcl();
  const { me } = useHuddle01();
  const [isOpen, setOpen] = useState(false); // hamburguer
  const { fetchAudioStream, stopAudioStream, error: micError, produceAudio, stream:micStream } = useAudio();
  const { fetchVideoStream, stopVideoStream, error: camError, produceVideo, stream:camStream } = useVideo();  
  const { startRecording, stopRecording, isStarting, inProgress, isStopping, error } = useRecording(); 
  const [videoFunction, setVideoFunction] = useState('play');  
  const [audioFunction, setAudioFunction] = useState('play'); 
  const videoRef = useRef<HTMLVideoElement | null>(null); 
  const audioRef = useRef<HTMLAudioElement | null>(null);   
  const [isModalOpen, setIsModalOpen] = useState(false);
	const { db } = initializeFirebaseClient()
  const carouselRef = useRef<AliceCarousel | null>(null);
  const [roomCreated, setRoomCreated] = useState(false) 
  const url = startRecording; // Pode não ser uma string

  const nextSlide = () => {
    if (carouselRef.current) {
      carouselRef.current.slideNext();
    }
  };

  const prevSlide = () => {
    if (carouselRef.current) {
      carouselRef.current.slidePrev();
    }
  };

  const responsive = {
    0: { items: 1 }, 
    450: { items: 2 }, 
    950: { items: 3 }, 
  };

  const slides = Object.values(peers)
  .filter((peer) => peer.role === 'coHost')
  .map((peer, peerId) => (
    <div className={styles.coHostCarousel}> 
      <div key={peerId} className={styles.slickItem}>          
        {peer.cam ? (
          <Video
            className={styles.videoPeers}
            peerId={peer.peerId}
            track={peer.cam!}
          />
        ) : (
          <div className={styles.videoHostPlay}>
            <BsFillCameraVideoOffFill className={styles.cameraOff} />
          </div>
        )}
        {peer.mic && (
          <Audio
            peerId={peer.peerId}
            track={peer.mic!}
          />
        )} 
      </div>     
    </div>
  )); 
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const roomButtonClick = () => {
    if (roomState === 'LOBBY') {
      try {
        joinRoom();
      } catch (error) {
        console.error('Erro:', error);
      }
    } else if (roomState === 'ROOM') {        
        setIsModalOpen(true);
    }
  };

  const buttonLabelRoom = () => {
    if (roomState === 'INIT') {       
      return <>
              <Loading />                      
             </>                                
    } else if (roomState === 'LOBBY') {
      return <> <IoLogIn className={styles.iconsPlay}/> 
                Entrar na Sala
             </> ;
    } else if (roomState === 'ROOM') {
      return <> <BsTelephoneX className={styles.iconsStop}/> 
                Encerrar Sala
             </>; 
    }
  };  

  const videoButtonClick = () => {
    if (videoFunction === 'play' && roomState === 'ROOM') {
      try {
        fetchVideoStream();
        setVideoFunction('stop');     
      } catch (error) {
        console.error('Erro:', error);
      }
    } else if (videoFunction === 'stop') {      
        stopVideoStream()
        setVideoFunction('play');
    } 
  };
  
  const buttonLabelVideo = () => {
    if (videoFunction === 'play') {
      return <> <HiOutlineVideoCamera className={styles.iconsPlay} />
      Iniciar Video
      </>;
    } else if (videoFunction === 'stop') {
      return <> <HiOutlineVideoCameraSlash className={styles.iconsStop} />
      Parar Video
      </>;
    } 
  };
  
  const audioButtonClick = () => {
    if (audioFunction === 'play' && roomState === 'ROOM') {
      try {
        fetchAudioStream();
        setAudioFunction('stop');
      } catch (error) {
        console.error('Erro:', error);
      }
    } else if (audioFunction === 'stop') {
      stopAudioStream()
      setAudioFunction('play');
    }
  };
  
  const buttonLabelAudio = () => {
    if (audioFunction === 'play') {
      return <> <BsMic className={styles.iconsPlay}/> 
      Iniciar Audio
      </> ;
    } else if (audioFunction === 'stop') {
      return <> <BsMicMute className={styles.iconsStop}/>
      Parar Audio
      </>;
    } 
  };

  useEffect(() => {
    if (roomState === "ROOM" && !roomCreated) {
      createNewRoom();
    }
  }, [roomState, roomCreated]); 

  async function getNextRoomName() {
    const querySnapshot = await getDocs(collection(db, 'auditorio'));
    const roomNames = querySnapshot.docs.map((doc) => doc.id);
  
    const highestNumber = roomNames.reduce((max, roomName) => {
      const match = roomName.match(/^Sala (\d+)$/);

      if (match) {
        const number = parseInt(match[1]);
        return number > max ? number : max;
      }
      return max;      
    }, 0);
  
    const nextRoomNumber = highestNumber + 1;
    console.log('ultima sala: ', highestNumber);
    return `Sala ${nextRoomNumber}`;
  }

  async function createNewRoom() {
    const roomName = await getNextRoomName();
    sessionStorage.setItem('roomName', roomName);
   
    try {
      const roomRef = doc(db, "auditorio", roomName)
      
      const currentDate = new Date();
      const roomId = sessionStorage.getItem('roomId');
      const token = sessionStorage.getItem('token');
           
      const roomData = { 
        date: currentDate,  
        roomId: roomId,
        token: token,     
        coHost: [], 
        slides: slides,
        stateRoom : "open",      
      }
      await setDoc(roomRef, roomData)
      console.log('Documento criado com ID: ', roomRef.id);
      setRoomCreated(true);
      
      return roomName;
    } catch (error) {
      console.error('Erro ao criar documento: ', error);
    }
  }
  
  async function updateCoHostList(coHostListCurrency : string[]) {
    const roomName = sessionStorage.getItem('roomName');
    console.log("co db: ", coHostListCurrency)

    try {
      if (typeof roomName === 'string') {
        const roomRef = doc(db, "auditorio", roomName);
        const coHostList = coHostListCurrency;
        console.log("co db: ", coHostListCurrency)

        const roomSnapshot = await getDoc(roomRef);
        if (roomSnapshot.exists()) {
          // Atualize o campo 'coHost' no Firestore com o novo array
          await updateDoc(roomRef, { coHost: coHostList });
          console.log(`Lista de co-hosts atualizada para ${roomName}`);
          console.log('Lista', coHostListCurrency);
        } else {
          console.error("Sala não encontrada no banco de dados.");
        }
      } else {
      console.error('roomName não é uma string válida.');
    }
    } catch (error) {
      console.error(`Erro ao atualizar a lista de co-hosts para ${roomName}: ${error}`);
    }
  }
  
  // Aguarde a conclusão de changePeerRole antes de continuar
  const coHostListCurrency = Object.values(peers)
    .filter((peer) => peer.role === 'coHost')
    .map((peer) => peer.peerId);
 
  useEventListener("room:peer-role-update", () => {
    updateCoHostList(coHostListCurrency);
    console.log('currency', coHostListCurrency);
  }
  )
  
  
  useEventListener("room:me-left", async () => {
    const roomName = sessionStorage.getItem('roomName');
   
    try {

      if (typeof roomName === 'string') {
        const roomRef = doc(db, "auditorio", roomName);
     
        const roomSnapshot = await getDoc(roomRef);
        if (roomSnapshot.exists()) {
          
          await updateDoc(roomRef, { stateRoom:"closed" });
          console.log("statusRoom definido como closed no banco de dados.");          
          window.location.href = 'https://ibeed.xyz/comunidade';
        } else {
          console.error("Sala não encontrada no banco de dados.");
        }
      } else {
        console.error('roomName não é uma string válida.');
      }
    } catch (error) {
      console.error("Erro ao atualizar statusRoom no banco de dados: ", error);
    }
  });
    
  async function initializeRoomId() {     
    const roomId = await createRoom();
    console.log('ID gerado:', roomId); 
    sessionStorage.setItem('roomId', roomId);
    const token = await createToken();
    //sessionStorage.setItem('token', token)
    joinLobby(roomId, token);  
    
  }     
  
  useEffect(() => {
    if (camStream) {
      produceVideo(camStream);
    }
  }, [camStream]);

  useEffect(() => {
    if (micStream) {
      produceAudio(micStream!); 
    }
  }, [micStream]);

  useEffect(() => {
    if (camStream && videoRef.current) { 
      videoRef.current.srcObject = camStream;
    }

    if (micStream && audioRef.current) {
      audioRef.current.srcObject = micStream;
    }
  }, [camStream, micStream]);

  useEffect(() => {
    initialize('8z2fmFJIBmrxNT2Pb5HwzJZoF9Lvni_2');
    initializeRoomId();   
  }, []);

  return (
    <div className={styles.mainContainer}>   
      <div className={styles.statusContainer}>    
        <button className={`${styles.btnStatus} ${roomState === 'ROOM' ? styles.greenButton : styles.redButton}`} />
        <span>{roomState === 'ROOM'  ? ' Ao Vivo' : ' Em Breve' }</span>
        <LuUsers className={styles.Icon}/> {Object.values(peers).length}     
      </div>
      <div className={styles.callContainer}>
       <h1>10ª Call da Comunidade</h1>   
      </div>           
      <div className={styles.auditorioContainer}>     
        <div className={styles.settingsContainer}>        
          <div className={styles.transmitionHost}>
            {videoFunction === 'play' && me.role === "host"? (
                <div className={styles.videoHostPlay}>
                  <BsFillCameraVideoOffFill className={styles.cameraOff} />
                </div>
              ) : (
              <div className={styles.videoHost}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={styles.videoHost}
                />
                <audio
                  ref={audioRef}
                  autoPlay
                  playsInline
                  className={styles.audioElement}
                />
              </div>
            )} 
            <div className={styles.statusMic}>
              <span>{audioFunction === 'play' ? 'Você está mutado' : '' }</span>
            </div>         
          </div> 
          <div className={styles.navbar}>                
            <Navbar isOpen={isOpen} toggleSidebar={() => setOpen(!isOpen)} /> 
            {isOpen && (
              <div className={styles.sidebar}>
                {Object.values(peers)
                .filter((peer) => peer.displayName) 
                .map((peer, index) => (                  
                  <span key={index}>
                    <button onClick={() => kickPeer(peer.peerId)}><BsX className={styles.iconsStop}/></button>
                    <LuUser /> {(peer.role === 'host') ? ("Anfitrião") : (peer.displayName)} 
                    <button onClick={() => {
                        if (peer.role === 'peer') {
                          changePeerRole(peer.peerId, 'coHost');
                        } else {
                          changePeerRole(peer.peerId, 'peer');
                        }
                    }}>
                      {(peer.role === 'peer') ? 
                        <>
                          <RiSpeakFill className={styles.iconsSpeakGreen} />
                        </> 
                        : 
                        <>
                          <RiSpeakFill className={styles.iconsSpeakRed}/>
                        </>
                        } 
                    </button>
                  </span> 
                ))} 
              </div>
            )}
          </div>            
        </div>
        {slides.length > 0 && (
          <div className={styles.carouselContent}> 
            <button onClick={prevSlide} className={`${slides.length < 4 ? styles.carouselButtonNone : styles.carouselButton}`}>
              <FaChevronLeft />
            </button>
          <div className={styles.carouselContainer}>
            
            <AliceCarousel
              autoWidth 
              responsive={responsive} 
              items={slides}
              mouseTracking
              disableDotsControls
              disableButtonsControls          
              ref={carouselRef}
            > 
              {slides} 
            </AliceCarousel>
            
          </div>    
            <button onClick={nextSlide} className={`${slides.length < 4 ? styles.carouselButtonNone : styles.carouselButton}`}>
              <FaChevronRight />
            </button>      
          </div> 
        )}         
        <div className={styles.admButtons}>         
          <button onClick={roomButtonClick}>
            {buttonLabelRoom()}
          </button>  

          <button onClick={videoButtonClick}>
            {buttonLabelVideo()}
          </button>

          <button onClick={audioButtonClick}>
            {buttonLabelAudio()}
          </button> 

          <button onClick={() =>
              startRecording(`${window.location.href}rec/`)}>
            START
          </button>
         
          <button onClick={stopRecording}>
            STOP
          </button>
         
          <Link href="/auditorio" target='blank' passHref>
          ENTRAR NO EVENTO
          </Link>
          {isStarting ? "Recording is starting": "NÃO DEU"} 
         
        </div>  
        {isModalOpen &&
          <ModalEndRoom onClose={closeModal}  />  
        }
      </div>   
    </div>    
  );
};
