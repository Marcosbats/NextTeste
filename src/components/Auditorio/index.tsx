import styles from  './styles.module.scss'
import Link from 'next/link';
import { useContext, useEffect, useRef, useState } from 'react';
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
import { createRoom } from '../../pages/api/roomId';
import { useAuthContext } from '../../contexts/auth';

import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';

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
  const { id } : any = useAuthContext();
  console.log('ID acessado na página Auditorio:', id);
  const responsive = {
    0: { items: 1 }, // Mostrar 1 slide em telas menores que 768px
    768: { items: 3 }, // Mostrar 2 slides em telas maiores que 768px
  };

  const slides = [
    me.role === 'coHost' ? (
      <div key="me" className={styles.slickItem}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.videoPeers}
        />
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          className={styles.audioElement}
        />
      </div>
    ) : null,
    ...Object.values(peers)
      .filter((peer) => peer.role === 'coHost')
      .map((peer) => (
        <div key={peer.peerId} className={styles.slickItem}>
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
      )),
  ];
  
  // Remove elementos nulos (caso `me.role !== 'coHost'`)
  const filteredSlides = slides.filter((slide) => slide !== null);

  let roomIdInitialized = false;

  async function initializeRoomId() {
    if (!roomIdInitialized) {
      roomIdInitialized = true;
      
      const roomId = await createRoom();

      sessionStorage.setItem('roomId', roomId);
      joinLobby(roomId);
      console.log("ESSee: ", roomId, roomState);
    }
  }

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleNameSubmit = (name: any) => { //Modal
    setUserName(name);
  };

  const handleLinkClick = () => { //hamburguer
    setOpen(false);
  }; 

  const roomButtonClick = () => {
    if (roomState.valueOf() === 'LOBBY') {
      try {
        joinRoom();
      } catch (error) {
        console.error('Erro:', error);
      }
    } else if (roomState.valueOf() === 'ROOM') { 
        leaveRoom();
        initialize('7pJkjKXWIJQpih8wHmsO5GHG2W-YKEv7');
        //initializeRoomId();
        joinLobby('xhl-nhth-yso');
        setAudioFunction('play');
        setVideoFunction('play');
    }
  };

  const buttonLabelRoom = () => {
    if (roomState === 'INIT') {
      return 'Conectando';
    } else if (roomState === 'LOBBY') {
      return 'Entrar na Sala';
    } else if (roomState === 'ROOM') {
      return <BsTelephoneX className={styles.iconsStop}/>;
    }
  };  
  
  useEffect(() => {
    if (camStream && videoRef.current) { 
      videoRef.current.srcObject = camStream;
    }
  
    if (micStream && audioRef.current) { 
      audioRef.current.srcObject = micStream;
    }
    }, [camStream, micStream]); 

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

  useEffect(() => {
    if (camStream) {
      produceVideo(camStream); 
    }
  }, [camStream]);

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

  useEffect(() => {
    if (micStream) {
      produceAudio(micStream!); 
    }
  }, [micStream]);

  useEffect(() => {
    initialize('7pJkjKXWIJQpih8wHmsO5GHG2W-YKEv7');
    //initializeRoomId();     
    joinLobby('xhl-nhth-yso');
  }, []);

  return (
    <div className={styles.mainContainer}>         
      {isModalOpen && (
        <>
          <ModalAuditorio onClose={closeModal} onNameSubmit={handleNameSubmit} />       
        </>
      )} 
      <div className={styles.statusContainer}>
        <button className={`${styles.btnStatus} ${roomState.valueOf() === 'ROOM' ? styles.greenButton : styles.redButton}`} />
        <span>{roomState.valueOf() === 'ROOM' ? ' Ao Vivo' : ' Em Breve'}</span>  <LuUsers className={styles.Icon} /> {Object.values(peers).length}
      </div>
      <div className={styles.callContainer}>
        <h1>10ª Call da Comunidade</h1> 
        <p>Aqui: {id}</p>          
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
          </div> 
          <div className={styles.navbar}>
            <Navbar isOpen={isOpen} toggleSidebar={() => setOpen(!isOpen)} />
          </div>
          {isOpen && (
            <div className={styles.sidebar}>
              {Object.values(peers)
                .filter((peer) => peer.displayName) 
                .map((peer, index) => (
                  <span key={index}><LuUser /> {(peer.role === 'host') ? ("ANFITRIÃO") : (peer.displayName)}</span>
                ))}
            </div>
          )}
        </div>
        <div className={styles.statusMic}>
          <span>{audioFunction === 'play' ? 'VOCÊ ESTÁ MUTADO' : '' }</span>
        </div>     

        <div className={styles.admButtons}>
          <button onClick={roomButtonClick}>
            {buttonLabelRoom()}
          </button>

          { me.role === 'coHost' &&(
            <>
              <button onClick={videoButtonClick}>
                {buttonLabelVideo()}
              </button>

              <button onClick={audioButtonClick}>
                {buttonLabelAudio()}
              </button> 
            </>
          ) 
          } 
        </div> 
        <div className={styles.Alice}>
        {slides.length > 0 && (
          <AliceCarousel
          responsive={responsive} 
          items={slides}
         // disableButtonsControls
          disableDotsControls
          >
           {slides}
         </AliceCarousel>
        )}
      </div>                     
      </div>
    </div>    
  );
};


