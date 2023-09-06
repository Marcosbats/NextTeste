import styles from  './styles.module.scss'
import { useHuddle01 } from '@huddle01/react';
import { Video, Audio } from '@huddle01/react/components';
import { useLobby, useAudio, useVideo, useRoom, useEventListener, usePeers, useAcl } from '@huddle01/react/hooks';
import { PeerTestnet } from '@thirdweb-dev/chains';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useDisplayName } from "@huddle01/react/app-utils";
import { Divide as Hamburger } from 'hamburger-react'
import { toast } from 'react-toastify'
import { LuUsers, LuUser } from "react-icons/lu";
import { HiMiniVideoCamera, HiOutlineVideoCamera, HiOutlineVideoCameraSlash} from "react-icons/hi2";
import { BsMicFill, BsMic, BsMicMute,  BsTelephoneX, BsTelephone, BsXCircle } from "react-icons/bs";
import axios from 'axios';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { FiArrowRight, FiChevronLeft, FiChevronRight} from 'react-icons/fi'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IPeer } from '@huddle01/react/dist/declarations/src/atoms/peers.atom';
import { Loading } from '../../Genericos/Loading'
import { createRoom } from '../../../pages/api/roomId';
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

export function Welcome(){ 
  const { initialize, isInitialized, roomState } = useHuddle01();
  const { joinLobby } = useLobby();  
  //const [roomId, setRoomId] = useState("");
  const { fetchAudioStream, stopAudioStream, error: micError, produceAudio, stopProducingAudio, stream:micStream } = useAudio();
  const { fetchVideoStream, stopVideoStream, error: camError, produceVideo, stopProducingVideo, stream:camStream } = useVideo(); 
  const { joinRoom, leaveRoom, endRoom } = useRoom();
  const { peers } = usePeers();  
  const { setDisplayName, error: displayNameError } = useDisplayName();
  const [videoFunction, setVideoFunction] = useState('play'); // Pode ser 'play' ou 'stop'  
  const [audioFunction, setAudioFunction] = useState('play'); 
  const [isMuted, setIsMuted] = useState(false); 
  const [isOpen, setOpen] = useState(false) // hamburguer
  const videoRef = useRef<HTMLVideoElement | null>(null); 
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { changePeerRole, changeRoomControls, kickPeer } = useAcl();
  const { me } = useHuddle01();
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
 

  useEffect(() => {
    // Essa função será executada sempre que camStream mudar
    if (camStream) {
      produceVideo(camStream); // Execute a função quando camStream estiver disponível
    }
  }, [camStream]);

  useEffect(() => {
    // Essa função será executada sempre que micStream mudar
    if (micStream) {
      produceAudio(micStream!); // Execute a função quando micStream estiver disponível
    }
  }, [micStream]);

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
    if (roomState === 'LOBBY') {
      try {
        joinRoom();
      } catch (error) {
        console.error('Erro:', error);
      }
    } else if (roomState === 'ROOM') { 
        endRoom();
        initialize('7pJkjKXWIJQpih8wHmsO5GHG2W-YKEv7');        
        //joinLobby(roomId);
        setAudioFunction('play');
        setVideoFunction('play');
    }
  };

  const buttonLabelRoom = () => {
    if (roomState === 'INIT') {
      initializeRoomId(); 
      return <>
              <Loading />                      
             </>                                
    } else if (roomState === 'LOBBY') {
      return <> <BsTelephone className={styles.iconsPlay}/> 
              Entrar na Sala
             </> ;
    } else if (roomState === 'ROOM') {
      return <> <BsTelephoneX className={styles.iconsStop}/> 
               Sair da Sala
             </>; 
    }
  };  

  const handleVideoButtonClick = () => {
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
  
  const handleAudioButtonClick = () => {
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
    // its preferable to use env vars to store projectId
    initialize('7pJkjKXWIJQpih8wHmsO5GHG2W-YKEv7');
   //joinLobby(roomd)    
  
  }, []);


  return (
    <div className={styles.mainContainer}>   
      <div className={styles.statusContainer}>    
        <button className={`${styles.btnStatus} ${videoFunction === 'stop' && audioFunction === 'stop' ? styles.greenButton : styles.redButton}`} />
        <span>{videoFunction === 'stop' && audioFunction === 'stop'  ? ' Ao Vivo' : ' Em Breve'}</span>
          <LuUsers className={styles.Icon}/> {Object.values(peers).length}     
      </div>
      <div className={styles.callContainer}>
       <h1>10ª Call da Comunidade {roomState}</h1> 
      </div>
           
      <div className={styles.auditorioContainer}>     
        <div className={styles.settingsContainer}>        
          <div className={styles.transmitionHost}>      
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
          <div className={styles.navbar}>                
            <Navbar isOpen={isOpen} toggleSidebar={() => setOpen(!isOpen)} /> 
          </div>
            {isOpen && (
              <div className={styles.sidebar}>
                {Object.values(peers)
                .filter((peer) => peer.displayName) // Filtra os peers com displayName definido
                .map((peer, index) => (
                  <Link href="" passHref> 
                  <span key={index}>
                    <LuUser /> {(peer.role === 'peer') ? (peer.displayName) : (me.role)} 
                    <button onClick={() => kickPeer(peer.peerId)}><BsXCircle className={styles.iconsRemove}/></button>
                    <button onClick={() => {
                        if (peer.role === 'peer') {
                          changePeerRole(peer.peerId, 'coHost');
                        } else if (peer.role === 'coHost')  {
                          changePeerRole(peer.peerId, 'listener');
                        }
                      }}>
                      {(peer.role === 'coHost') ? 'H' : 'L'}
                    </button>
                  </span></Link> 
                ))} 
              </div>
            )}
          </div>         
               
        <Carousel showStatus={false} showThumbs={false} showIndicators={false} className={styles.customCarousel}>
          {Object.values(peers)
            .filter((peer) => peer.cam || peer.mic)
            .map((peer) => (
              <div key={peer.peerId} className={styles.carouselItem}>
                {peer.cam && (
                  <Video
                    className={styles.videoPeers}
                    peerId={peer.peerId}
                    track={peer.cam!}
                  />
                )}
                {peer.mic && (
                  <Audio
                    peerId={peer.peerId}
                    track={peer.mic!}
                  />
                )}
              </div>
            ))}
        </Carousel>      
          
        <div className={styles.admButtons}>
          
          <button onClick={handleRoomButtonClick}>
            {buttonLabelRoom()}
            </button>  

          <button
            disabled={!fetchVideoStream.isCallable }
            onClick={handleVideoButtonClick}
            >
              {buttonLabelVideo()}
             </button>

          <button
            disabled={!fetchAudioStream.isCallable || !produceAudio.isCallable }
            onClick={handleAudioButtonClick}
            >
              {buttonLabelAudio()}
          </button> 

          <Link className={styles.btnAuditorio} href="/auditorio" target='blank' passHref>
            ENTRAR NO EVENTO
          </Link>
        </div>
      </div>  
      
    </div>    
  );
};

