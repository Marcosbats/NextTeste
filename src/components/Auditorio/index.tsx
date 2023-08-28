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
import axios from 'axios';

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
  const [displayNameText, setDisplayNameText] = useState("Guest");    
  const { setDisplayName, error: displayNameError } = useDisplayName();
  const [videoFunction, setVideoFunction] = useState('start'); // Pode ser 'start', 'play' ou 'stop'  
  const [audioFunction, setAudioFunction] = useState('start'); 
  //const [roomFunction, setRoomFunction] = useState('start'); 
  const [isOpen, setOpen] = useState(false) // hamburguer

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
        joinLobby('ymc-rdab-lew');
        setAudioFunction('start');
        setVideoFunction('start');
        
    }
  };

  const getButtonLabelRoom = () => {
    if (roomState.valueOf() === 'LOBBY') {
      return 'Entrar';
    } else if (roomState.valueOf() === 'ROOM') {
      return 'Sair';
    } else {
      return 'Loading';
    }
  };

  const handleVideoButtonClick = () => {
    if (videoFunction === 'start') {
      try {
        fetchVideoStream();
        setVideoFunction('play');
      } catch (error) {
        console.error('Erro:', error);
      }
    } else if (videoFunction === 'play') {      
        produceVideo(camStream);
        setVideoFunction('stop');
    } else if (videoFunction === 'stop') {
      stopVideoStream()
      setVideoFunction('start');
    }
  };
  
  const buttonLabelVideo = () => {
    if (videoFunction === 'start') {
      return 'Ligar Camera';
    } else if (videoFunction === 'play') {
      return 'Reproduzir Video';
    } else if (videoFunction === 'stop') {
      return 'Parar Video';
    }
  };
  
  const handleAudioButtonClick = () => {
    if (audioFunction === 'start') {
      try {
        fetchAudioStream();
        setAudioFunction('play');
      } catch (error) {
        console.error('Erro:', error);
      }
    } else if (audioFunction === 'play') {      
        produceAudio(micStream!);
        setAudioFunction('stop');
    } else if (audioFunction === 'stop') {
      stopAudioStream()
      setAudioFunction('start');
    }
  };
  
  const buttonLabelAudio = () => {
    if (audioFunction === 'start') {
      return 'Ligar Audio';
    } else if (audioFunction === 'play') {
      return 'Reproduzir Audio';
    } else if (audioFunction === 'stop') {
      return 'Parar Audio';
    }
  };

  useEffect(() => {
    // its preferable to use env vars to store projectId
    initialize('7pJkjKXWIJQpih8wHmsO5GHG2W-YKEv7');
    joinLobby('ymc-rdab-lew');
    
  }, []);
   
  useEffect(() => {
    if (camStream) {
      const videoElement = document.getElementById('camVideo') as HTMLVideoElement;
      videoElement.srcObject = camStream;
    }

    if (micStream) {
      const audioElement = document.getElementById('micAudio') as HTMLAudioElement;
      audioElement.srcObject = micStream;
    }
  }, [camStream, micStream]);

  useEventListener("room:peer-joined", () => {
    // Write your logic here
    toast.success("Novo usuário na sala");
  });
  useEventListener("room:peer-left", () => {
    // Write your logic here
    toast.success("Usuário saiu da sala");
  });
 
  return (
    <div className={styles.mainContainer}>   
      <div className={styles.statusContainer}>    
        <button className={`${styles.btnStatus} ${roomState.valueOf() === 'ROOM' ? styles.greenButton : styles.redButton}`} />
        <span>{roomState.valueOf() === 'ROOM' ? ' Ao Vivo' : ''}</span>                 
      </div>
      <div className={styles.callContainer}>
       <h1>10ª Call da Comunidade</h1>
      </div>
           
      <div className={styles.auditorioContainer}>     
        <div className={styles.settingsContainer}>
          <div className={styles.navbar}>                
            <Navbar isOpen={isOpen} toggleSidebar={() => setOpen(!isOpen)} /> 
          </div>
            {isOpen && (
              <div className={styles.sidebar}>
                {Object.values(peers)
                .filter((peer) => peer.displayName) // Filtra os peers com displayName definido
                .map((peer, index) => (
                  <Link href="" passHref> <span key={index}>{peer.displayName}</span></Link>
                ))} 
              </div>
            )}
        </div>  
        <div className={styles.transmitionContainer}>
           {/*  <div className={styles.transmitionHost}>      
            <video
              id="camVideo"
              autoPlay
              playsInline
              muted
              className={styles.videoHost}
            />
            <audio
              id="micAudio"
              autoPlay
              // eslint-disable-next-line react/no-unknown-property
              playsInline
            // muted
              className={styles.audioElement}
          />   
                </div> */}

       <div className={styles.transmitionPeers}>
            {Object.values(peers)
              .filter((peer) => peer.cam)
              .map((peer) => (
                <>
                  <Video
                    className={styles.videoPeers}
                    key={peer.peerId}
                    peerId={peer.peerId}
                    track={peer.cam!}
                    //debug    
                  />
                </>
              ))}
            {Object.values(peers)
              .filter((peer) => peer.mic)
              .map((peer) => (
                <Audio 
                key={peer.peerId} 
                peerId={peer.peerId} 
                track={peer.mic!} />
            ))}
              </div> 
        </div> 

        <div className={styles.admButtons}>  

        <button disabled={!joinRoom.isCallable && !leaveRoom.isCallable}
        onClick={handleRoomButtonClick}>
        {getButtonLabelRoom()}
        </button>
             
         
          <button
            disabled={!fetchVideoStream.isCallable || !produceVideo.isCallable }
            onClick={handleVideoButtonClick}
            >
              {buttonLabelVideo()}
          </button>

          <button
            disabled={!fetchAudioStream.isCallable ||!produceAudio.isCallable }
            onClick={handleAudioButtonClick}
            >
              {buttonLabelAudio()}
          </button>
  
          <h2>Usuários na Sala : {Object.values(peers).length}</h2> 

        </div>
        

        <input
            type="text"
            placeholder="Your Room Id"
            value={displayNameText}
            onChange={(e) => setDisplayNameText(e.target.value)}
            className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none mr-2"
          />
          <button
            disabled={!setDisplayName.isCallable}
            onClick={() => {
              setDisplayName(displayNameText);
            }}
          >
            {`NOME ${displayNameError}`}
          </button>
      </div>  
    </div>    
  );
};

