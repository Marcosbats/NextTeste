import styles from  './styles.module.scss'
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useHuddle01 } from '@huddle01/react';
import { Video, Audio } from '@huddle01/react/components';
import { useLobby, useAudio, useVideo, useRoom, useEventListener, usePeers, useAcl } from '@huddle01/react/hooks';
import { useDisplayName, useAppUtils } from "@huddle01/react/app-utils";
import { Divide as Hamburger } from 'hamburger-react'
import { toast } from 'react-toastify'
import { LuUser, LuUsers } from "react-icons/lu";
import { HiOutlineVideoCamera, HiOutlineVideoCameraSlash } from "react-icons/hi2";
import { BsFillCameraVideoOffFill, BsMic, BsMicMute, BsTelephoneX } from "react-icons/bs";
import { ModalAuditorio } from '../../components/Genericos/Modal';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import { ModalKickerPeer } from '../Genericos/ModalKickerPeer';
import { Slider } from '../Carousel'
import { collection, getDocs, limit, orderBy,query } from 'firebase/firestore';
import initializeFirebaseClient from '@/src/services/firebaseConnection';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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

export function Auditorio(){ 
  const { initialize, roomState } = useHuddle01();
  const { joinLobby } = useLobby(); 
  const { joinRoom, leaveRoom } = useRoom();
  const { peers } = usePeers();  
  const { fetchAudioStream, stopAudioStream, error: micError, produceAudio, stream:micStream } = useAudio();
  const { fetchVideoStream, stopVideoStream, error: camError, produceVideo, stream:camStream } = useVideo();    
  const [videoFunction, setVideoFunction] = useState('play');   
  const [audioFunction, setAudioFunction] = useState('play'); 
  const videoRef = useRef<HTMLVideoElement | null>(null); 
  const audioRef = useRef<HTMLAudioElement | null>(null);  
  const [isOpen, setOpen] = useState(false) // hamburguer
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [userName, setUserName] = useState('');  
  const { setDisplayName, error: displayNameError } = useDisplayName();
  const { me } = useHuddle01();
  const { role, displayName } = me;
  const { db } = initializeFirebaseClient();  
  const [idleCount, setIdleCount] = useState(0); 
  const carouselRef = useRef<AliceCarousel | null>(null);

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
  const [slides, setSlides] = useState<JSX.Element[]>([]); // Provide an initial empty array

  // Your event listener
  useEventListener("room:peer-produce-start", () => {
    // Assuming you have access to the 'peers' and 'me' objects
    const updatedSlides  = Object.values(peers)
  .filter((peer) => peer.role === 'coHost')
  .map((peer) => (
    <div className={styles.coHostCarousel}> 
      <div key={peer.peerId} className={styles.slickItem}>          
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
  if (me.role === 'coHost') {
    updatedSlides.push(      
    <div className={styles.coHostCarousel}> 
      <div key="me" className={styles.meItem}>
        {videoFunction === "stop" ? (        
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.videoPeers}
          />
        ):(
          <div className={styles.videoHostPlay}>
          <BsFillCameraVideoOffFill className={styles.cameraOff} />
          </div>)}       
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          className={styles.audioElement}
        />
      </div>
      </div>
    );
  }

  setSlides(updatedSlides); // Update the slides state
});
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleNameSubmit = (name: any) => { //Modal
    setUserName(name);
  };

  const handleLinkClick = () => { //hamburguer
    setOpen(false);
  }; 

  const videoButtonClick = () => {
    if (videoFunction === 'play') {
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
      return <HiOutlineVideoCamera className={styles.iconsPlay} />;
    } else if (videoFunction === 'stop') {
      return <HiOutlineVideoCameraSlash className={styles.iconsStop} />;
    } 
  };

  const audioButtonClick = () => {
    if (audioFunction === 'play') {
      try {
        fetchAudioStream();
        //produceAudio(micStream!);
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
      return <BsMic className={styles.iconsPlay}/>;
    } else if (audioFunction === 'stop') {
      return <BsMicMute className={styles.iconsStop}/>;
    } 
  };
  

  async function fetchLastRoomData() {
    const collectionRef = collection(db, "auditorio");

    // Consulta os documentos ordenados por um campo (por exemplo, data) em ordem decrescente
    const resultado = query(collectionRef, orderBy("date", "desc"), limit(1));

    try {
      const querySnapshot = await getDocs(resultado);
      if (!querySnapshot.empty) {
        // Obtem o documento encontrado
        const document = querySnapshot.docs[0].data();
        return document;
      } else {
        console.log("Nenhum documento encontrado na coleção 'auditorio'.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar o último documento: ", error);
      return null;
    }
  }

  async function renderLastRoomData() {
    const lastRoomData = await fetchLastRoomData();

    if (lastRoomData) {

      const roomName = lastRoomData.name;
      const date = lastRoomData.date;
      const roomId = lastRoomData.roomId;
      joinLobby(roomId);
      console.log("salaaa:",roomId)

    }
  }

  useEffect(() => {
    if (roomState === 'IDLE') {      
      setIdleCount(idleCount + 1);
    }
  }, [roomState]);

  useEffect(() => {
    if (camStream && videoRef.current) { 
      videoRef.current.srcObject = camStream;
    }
  
    if (micStream && audioRef.current) { 
      audioRef.current.srcObject = micStream;
    }
    }, [camStream, micStream]);   

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
    initialize('7pJkjKXWIJQpih8wHmsO5GHG2W-YKEv7');
    renderLastRoomData();
  }, []);

  return (
    <div className={styles.mainContainer}> 

      {isModalOpen && (
        <>
          <ModalAuditorio onClose={closeModal} onNameSubmit={handleNameSubmit} />       
        </>
      )}

      {idleCount === 2 && (
        <>
          <ModalKickerPeer onClose={closeModal} />       
        </>
      )}     

      <div className={styles.statusContainer}>
        <button className={`${styles.btnStatus} ${roomState.valueOf() === 'ROOM' ? styles.greenButton : styles.redButton}`} />
        <span>{roomState.valueOf() === 'ROOM' ? ' Ao Vivo' : ' Em Breve'}</span>  <LuUsers className={styles.Icon} /> {Object.values(peers).length}
      </div>
      <div className={styles.callContainer}>
        <h1>10ª Call da Comunidade</h1> 
      </div>
      <div className={styles.auditorioContainer}>
        <div className={styles.settingsContainer}>
          <div className={styles.transmitionContainer}>      
            {Object.values(peers)
            .filter((peer) => peer.role === 'host')
            .map((peer) => (
              <div key={peer.peerId} className={styles.transmitionHost} >
                {peer.cam ?(
                  <Video
                    className={styles.videoHost}
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
              ))
            } 
            <div className={styles.statusMic}>
              <span>{ me.role === 'coHost' && audioFunction === 'play' ? 'Você está mutado' : '' }</span>
            </div>   
          </div> 
          <div className={styles.navbar}>
            <Navbar isOpen={isOpen} toggleSidebar={() => setOpen(!isOpen)} />
            {isOpen && (
              <div className={styles.sidebar}>
                <div className={styles.sub}>
                  {Object.values(peers)
                    .filter((peer) => peer.displayName) 
                    .map((peer, index) => (
                      <span key={index}><LuUser /> {(peer.role === 'host') ? ("Anfitrião") : (peer.displayName)}</span>
                    ))}
                </div>
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
          
          <Link href='https://ibeed.xyz/comunidade' onClick={leaveRoom}>
            <BsTelephoneX className={styles.iconsStop}/> 
            Sair da Sala
          </Link>        

          { me.role === 'coHost' &&(
            <>
              <button onClick={videoButtonClick}>
                {buttonLabelVideo()}
              </button>

              <button onClick={audioButtonClick}>
                {buttonLabelAudio()}
              </button> 
            </>
          )} 
        </div>                    
      </div>
      <Slider />
    </div>    
  );
};


