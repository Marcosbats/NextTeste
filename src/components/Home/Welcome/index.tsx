import styles from  './styles.module.scss'
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useHuddle01 } from '@huddle01/react';
import { Video, Audio } from '@huddle01/react/components';
import { useDisplayName } from "@huddle01/react/app-utils";
import { useLobby, useAudio, useVideo, useRoom, usePeers, useAcl, useEventListener } from '@huddle01/react/hooks';
import { Divide as Hamburger } from 'hamburger-react'
import { toast } from 'react-toastify'
import { LuUsers, LuUser } from "react-icons/lu";
import { HiOutlineVideoCamera, HiOutlineVideoCameraSlash} from "react-icons/hi2";
import { BsMic, BsMicMute,  BsTelephoneX, BsX, BsFillCameraVideoOffFill } from "react-icons/bs";
import { IoLogIn } from "react-icons/io5";
import { RiSpeakFill } from "react-icons/ri";
import { Loading } from '../../Genericos/Loading'
import { createRoom } from '../../../pages/api/roomId';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import { ModalEndRoom } from '../../Genericos/ModalEndRoom';
import { Slider } from '../../Carousel'
import initializeFirebaseClient from '../../../services/firebaseConnection'
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'

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
  const { joinRoom, endRoom } = useRoom(); 
  const { peers } = usePeers();
  const { setDisplayName, error: displayNameError } = useDisplayName();
  const { changePeerRole, kickPeer } = useAcl();
  const { me } = useHuddle01();
  const { role, displayName } = me;
  const [isOpen, setOpen] = useState(false); // hamburguer
  const { fetchAudioStream, stopAudioStream, error: micError, produceAudio, stream:micStream } = useAudio();
  const { fetchVideoStream, stopVideoStream, error: camError, produceVideo, stream:camStream } = useVideo();  
  const [videoFunction, setVideoFunction] = useState('play');  
  const [audioFunction, setAudioFunction] = useState('play'); 
  const videoRef = useRef<HTMLVideoElement | null>(null); 
  const audioRef = useRef<HTMLAudioElement | null>(null);   
  const [isModalOpen, setIsModalOpen] = useState(false);
	const { db } = initializeFirebaseClient()
  

  async function getNextRoomName() {
    const querySnapshot = await getDocs(collection(db, 'auditorio'));
    const roomNames = querySnapshot.docs.map((doc) => doc.id);
  
    const highestNumber = roomNames.reduce((max, roomName) => {
      const match = roomName.match(/^Sala(\d+)$/);
      if (match) {
        const number = parseInt(match[1]);
        return number > max ? number : max;
      }
      return max;
    }, 0);
  
    const nextRoomNumber = highestNumber + 1;
    return `Sala ${nextRoomNumber}`;
  }

  async function createNewRoom() {
     const roomName = await getNextRoomName();
    
      try {
        const userBase = doc(db, "auditorio", roomName)
        
        const currentDate = new Date();
        const roomId = sessionStorage.getItem('roomId');
        const status = Object.values(peers)
                        .filter((peer) => peer.role === 'coHost')
        
        const coHostIds = status.map((coHost) => coHost.peerId);

        const userData = {
          name: "Call", 
          date: currentDate,  
          roomId: roomId,   
          coHost: coHostIds,     

        }
        await setDoc(userBase, userData)
        console.log('Documento criado com ID: ', userBase.id);
      } catch (error) {
        console.error('Erro ao criar documento: ', error);
      }
    }
  
  const responsive = {
    0: { items: 1 }, 
    450: { items: 2 }, 
    950: { items: 3 },
  };

  const slides = Object.values(peers)
  .filter((peer) => peer.role === 'coHost')
  .map((peer) => (
    <div key={peer.peerId} className={styles.slickItem}>
      {peer.cam ?(
          <Video
            className={styles.videoPeers}
            peerId={peer.peerId}
            track={peer.cam!}
          />
        ) : (
        <div className={styles.videoHostPlay}>
          <BsFillCameraVideoOffFill className={styles.cameraOff} />
        </div>)}
      {peer.mic && (
        <Audio
          peerId={peer.peerId}
          track={peer.mic!}
        />
      )}
    </div>
  ));

 
  async function initializeRoomId() {
      
      const roomId = await createRoom();
      console.log('ID gerado:', roomId);  
      sessionStorage.setItem('roomId', roomId);
      joinLobby(roomId);      
    
  } 
    
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLinkClick = () => { //hamburguer
    setOpen(false);
  }; 

  const roomButtonClick = () => {
    if (roomState === 'LOBBY') {
      try {
        joinRoom();
        createNewRoom();
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
    initialize('7pJkjKXWIJQpih8wHmsO5GHG2W-YKEv7');
    initializeRoomId();   
  }, []);


  return (
    <div className={styles.mainContainer}>   
      <div className={styles.statusContainer}>    
        <button className={`${styles.btnStatus} ${roomState === 'ROOM' ? styles.greenButton : styles.redButton}`} />
        <span>{roomState === 'ROOM'  ? ' Ao Vivo' : ' Em Breve'}</span>
          <LuUsers className={styles.Icon}/> {Object.values(peers).length}     
      </div>
      <div className={styles.callContainer}>
       <h1>10ª Call da Comunidade</h1>        
      </div>           
      <div className={styles.auditorioContainer}>     
        <div className={styles.settingsContainer}>        
          <div className={styles.transmitionHost}>
            {videoFunction === 'play' ? (
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
                        } else if (peer.role === 'coHost')  {
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
        <div className={styles.carouselContainer}>         
          <AliceCarousel
            responsive={responsive} 
            items={slides}
            disableDotsControls
          > 
            <div className={styles.coHostCarousel}>{slides}</div> 
          </AliceCarousel>
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

          <Link href="/auditorio" target='blank' passHref>
          ENTRAR NO EVENTO
          </Link>
          <Link href="/carousel" target='blank' passHref>
          ENTRAR NO EVENTO
          </Link>
        </div>  
        {isModalOpen &&
          <ModalEndRoom onClose={closeModal}  />  
        }
      </div>   
        <Slider/>             
    </div>    
  );
};

