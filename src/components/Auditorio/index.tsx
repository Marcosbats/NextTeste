import styles from  './styles.module.scss'
import { useHuddle01 } from '@huddle01/react';
import { Video, Audio } from '@huddle01/react/components';
import { useLobby, useAudio, useVideo, useRoom, useEventListener, usePeers, useAcl } from '@huddle01/react/hooks';
import { PeerTestnet } from '@thirdweb-dev/chains';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Divide as Hamburger } from 'hamburger-react'
import { toast } from 'react-toastify'
import { LuUsers } from "react-icons/lu";
import { LuUser } from "react-icons/lu";
import { HiMiniVideoCamera } from "react-icons/hi2";
import { HiOutlineVideoCamera } from "react-icons/hi2";
import { HiOutlineVideoCameraSlash } from "react-icons/hi2";
import { BsMicFill } from "react-icons/bs";
import { BsMic } from "react-icons/bs";
import { BsMicMute } from "react-icons/bs";
import { BsTelephoneX } from "react-icons/bs";
import axios from 'axios';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { FiArrowRight, FiChevronLeft, FiChevronRight} from 'react-icons/fi'
//import { FaChevronLeft, FaChevronRight, } from 'react-icons/fa';
import { ModalAuditorio } from '../../components/Genericos/Modal';
import { useDisplayName } from "@huddle01/react/app-utils";
import { useAppUtils } from "@huddle01/react/app-utils"
import { createRoom } from '../../pages/api/roomId';
//Hamburguer
interface NavbarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isOpen, toggleSidebar }) => {
  const navbarClassName = isOpen ? 'navbar' : 'navbar hidden';

  return(
    <div className={navbarClassName}>
    <Hamburger toggled={isOpen}
    size={parseInt("25")} rounded toggle={toggleSidebar} />
    </div>   
  )
}


export function Auditorio(){ 
  const { initialize, isInitialized, roomState } = useHuddle01();
  const { joinLobby } = useLobby();  
  const [roomId, setRoomId] = useState("");
  const { fetchAudioStream, stopAudioStream, error: micError, produceAudio, stopProducingAudio, stream:micStream } = useAudio();
  const { fetchVideoStream, stopVideoStream, error: camError, produceVideo, stopProducingVideo, stream:camStream } = useVideo(); 
  const { joinRoom, leaveRoom } = useRoom();
  const { peers } = usePeers();  
  const [videoFunction, setVideoFunction] = useState('play'); // Pode ser 'start', 'play' ou 'stop'  
  const [audioFunction, setAudioFunction] = useState('play'); 
  const [isOpen, setOpen] = useState(false) // hamburguer
  const videoRef = useRef<HTMLVideoElement | null>(null); // Defina o tipo do ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [userName, setUserName] = useState('');
  const { setDisplayName, error: displayNameError } = useDisplayName();
  const [displayNameText, setDisplayNameText] = useState(" ");
  const { me } = useHuddle01();
 
  const { sendData } = useAppUtils() 
 
  const { role, displayName } = me;
  let roomIdInitialized = false;

  async function initializeRoomId() {
    // Chame a função createRoom para obter o roomId
    if (!roomIdInitialized) {
      // Defina a variável de controle como verdadeira para evitar chamadas repetidas
      roomIdInitialized = true;
      
      // Chame a função createRoom para obter o roomId
      const roomId = await createRoom();
  
      // Armazene o roomId no sessionStorage
      sessionStorage.setItem('roomId', roomId);
      joinLobby(roomId);
      console.log("ESSee: ", roomId, roomState);
    }
  }

  const sendDataToSpecificPeer = () => {
    sendData(["*"], { message: "Hello World" })
  };

  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleNameSubmit = (name: any) => {
    setUserName(name);
  };
 
 useEffect(() => {
  if (camStream && videoRef.current) { // Verifica se videoRef.current não é nulo
    videoRef.current.srcObject = camStream;
  }

  if (micStream && audioRef.current) { // Verifica se audioRef.current não é nulo
    audioRef.current.srcObject = micStream;
  }
}, [camStream, micStream]);

  const handleLinkClick = () => { //hamburguer
    setOpen(false);
  }; 

  const handleRoomButtonClick = () => {
    if (roomState.valueOf() === 'LOBBY') {
      try {
        joinRoom();
      } catch (error) {
        console.error('Erro:', error);
      }
    } else if (roomState.valueOf() === 'ROOM') { 
        leaveRoom();
        initialize('7pJkjKXWIJQpih8wHmsO5GHG2W-YKEv7');
        //joinLobby('itn-cejx-ozv');
        setAudioFunction('play');
        setVideoFunction('play');
    }
  };


  const buttonLabelRoom = () => {
    if (roomState === 'INIT') {
      initializeRoomId(); 
      return 'Conectando';
    } else if (roomState === 'LOBBY') {
      return 'Entrar na Sala';
    } else if (roomState === 'ROOM') {
      return <BsTelephoneX className={styles.icons}/>;
    }
  };
  

  const handleVideoButtonClick = () => {
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

  useEffect(() => {
    // Essa função será executada sempre que camStream mudar
    if (camStream) {
      produceVideo(camStream); // Execute a função quando camStream estiver disponível
    }
  }, [camStream]);

  
  const handleAudioButtonClick = () => {
    if (audioFunction === 'play') {
      try {
        fetchAudioStream();
        produceAudio(micStream!);
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


  useEffect(() => {
    // its preferable to use env vars to store projectId
    initialize('7pJkjKXWIJQpih8wHmsO5GHG2W-YKEv7');
    //joinLobby('itn-cejx-ozv');
    
  }, []);

  return (
    <div className={styles.mainContainer}>  
       
      {isModalOpen && (
       <>
        <ModalAuditorio onClose={closeModal} onNameSubmit={handleNameSubmit} />
       
      </>
      )} 

      {userName && (
         <></>
         )}
        <div className={styles.statusContainer}>
            <p>Bem-vindo, {userName}!</p>
          <button className={`${styles.btnStatus} ${roomState.valueOf() === 'ROOM' ? styles.greenButton : styles.redButton}`} />
          <span>{roomState.valueOf() === 'ROOM' ? ' Ao Vivo' : ' Em Breve'}</span>  <LuUsers className={styles.Icon} /> {Object.values(peers).length}
        </div><div className={styles.callContainer}>
            <h1>10ª Call da Comunidade</h1>
           
          </div>
          <div className={styles.auditorioContainer}>
            <div className={styles.settingsContainer}>
              <div className={styles.transmitionHost}>
                {Object.values(peers)
                  .filter((peer) => peer.role === 'host') // Filtra os peers com role igual a 'host'
                  .map((peer) => (
                    <>
                      {peer.cam && (
                        <Video
                          className={styles.videoHost}
                          key={peer.peerId}
                          peerId={peer.peerId}
                          track={peer.cam!} />
                      )}
                      {peer.mic && (
                        <Audio
                          key={peer.peerId}
                          peerId={peer.peerId}
                          track={peer.mic!} />
                      )}
                    </>
                  ))}

              </div>
              <div className={styles.navbar}>
                <Navbar isOpen={isOpen} toggleSidebar={() => setOpen(!isOpen)} />
              </div>
              {isOpen && (
                <div className={styles.sidebar}>
                  {Object.values(peers)
                    .filter((peer) => peer.displayName) // Filtra os peers com displayName definido
                    .map((peer, index) => (
                      <Link href="" passHref> <span key={index}><LuUser /> {peer.displayName}</span></Link>
                    ))}
                </div>
              )}
            </div>


            <Carousel showStatus={false} showThumbs={false} showIndicators={false} className={styles.customCarousel}>

              {Object.values(peers)
                .filter((peer) => peer.cam || peer.mic && peer.role !== 'host')
                .map((peer) => (
                  <div key={peer.peerId} className={styles.carouselItem}>
                    {peer.cam && (
                      <Video
                        className={styles.videoPeers}
                        peerId={peer.peerId}
                        track={peer.cam!} />
                    )}
                    {peer.mic && (
                      <Audio
                        peerId={peer.peerId}
                        track={peer.mic!} />
                    )}
                  </div>
                ))}

            </Carousel>

            <div className={styles.admButtons}>
              <button
                disabled={!joinRoom.isCallable && !leaveRoom.isCallable}
                onClick={handleRoomButtonClick}
              >
                {buttonLabelRoom()}

              </button>

              { me.role === 'coHost' && (
                <>
                <button
                  disabled={!fetchVideoStream.isCallable }
                  onClick={handleVideoButtonClick}
                  >
                    {buttonLabelVideo()}
                </button>

                <button
                  disabled={!fetchAudioStream.isCallable || !produceAudio.isCallable}
                  onClick={handleAudioButtonClick}
                >
                  {buttonLabelAudio()}
                </button> 
                </>
              )}

            <button onClick={sendDataToSpecificPeer}> Send data to specific peer </button>
            </div>
                     
          </div>
      </div>    
  );
};


