import styles from  './styles.module.scss'
import Link from 'next/link';
import { useContext, useEffect, useRef, useState } from 'react';
import { useHuddle01 } from '@huddle01/react';
import { Video, Audio } from '@huddle01/react/components';
import { useDisplayName } from "@huddle01/react/app-utils";
import { IPeer } from '@huddle01/react/dist/declarations/src/atoms/peers.atom';
import { useLobby, useAudio, useVideo, useRoom, useEventListener, usePeers, useAcl } from '@huddle01/react/hooks';
import { Divide as Hamburger } from 'hamburger-react'
import { toast } from 'react-toastify'
import { LuUsers, LuUser } from "react-icons/lu";
import { HiOutlineVideoCamera, HiOutlineVideoCameraSlash} from "react-icons/hi2";
import { BsMic, BsMicMute,  BsTelephoneX, BsX, BsFillCameraVideoOffFill } from "react-icons/bs";
import { IoLogIn } from "react-icons/io5";
import { RiSpeakFill } from "react-icons/ri";
import { Loading } from '../../Genericos/Loading'
import { createRoom } from '../../../pages/api/roomId';
import { useAuthContext } from '../../../contexts/auth';
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
  const { setId } : any = useAuthContext();
  const responsive = {
    0: { items: 1 }, // Mostrar 1 slide em telas menores que 768px
    768: { items: 3 }, // Mostrar 2 slides em telas maiores que 768px
  };
  const slides = Object.values(peers)
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
  ));
 
  let roomIdInitialized = false;

  async function initializeRoomId() {
   
    if (!roomIdInitialized) {
      roomIdInitialized = true;
      
      const roomId = await createRoom();
      setId(roomId);
      console.log('ID gerado:', roomId);  
      sessionStorage.setItem('roomId', roomId);
      joinLobby(roomId);      
    }
  } 
  
  const handleLinkClick = () => { //hamburguer
    setOpen(false);
  }; 

  const roomButtonClick = () => {
    if (roomState === 'LOBBY') {
      try {
        joinRoom();
      } catch (error) {
        console.error('Erro:', error);
      }
    } else if (roomState === 'ROOM') { 
        endRoom();
        initialize('7pJkjKXWIJQpih8wHmsO5GHG2W-YKEv7');        
        //initializeRoomId();
        joinLobby('xhl-nhth-yso');
        setAudioFunction('play');
        setVideoFunction('play');
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
               Sair da Sala
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
    //initializeRoomId(); 
    joinLobby('xhl-nhth-yso');
  
  }, []);

  return (
    <div className={styles.mainContainer}>   
      <div className={styles.statusContainer}>    
        <button className={`${styles.btnStatus} ${videoFunction === 'stop' && audioFunction === 'stop' ? styles.greenButton : styles.redButton}`} />
        <span>{videoFunction === 'stop' && audioFunction === 'stop'  ? ' Ao Vivo' : ' Em Breve'}</span>
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
                          <RiSpeakFill className={styles.iconsPlay} />
                        </> 
                        : 
                        <>
                          <RiSpeakFill className={styles.iconsStop}/>
                        </>
                        } 
                    </button>
                  </span> 
                ))} 
              </div>
            )}
          </div>            
        </div>  
         
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
          <span>{audioFunction === 'play' ? 'VOCÊ ESTÁ MUTADO' : '' }</span>
        
        </div>
        <div className={styles.Alice} >
          <AliceCarousel
            responsive={responsive}
            items={slides}
            //disableButtonsControls
            >
              <div className={styles.aliceSlide}>
            {slides}
            </div>
          </AliceCarousel>
        </div>       
      </div>                
    </div>    
  );
};

