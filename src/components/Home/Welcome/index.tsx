import styles from  './styles.module.scss'
import { useHuddle01 } from '@huddle01/react';
import { Video } from '@huddle01/react/components';
import { useLobby, useAudio, useVideo, useRoom, useEventListener, usePeers } from '@huddle01/react/hooks';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export function Welcome(){ 
  const { initialize, isInitialized, roomState } = useHuddle01();
  const { joinLobby } = useLobby();  
  const [roomId, setRoomId] = useState("");
  const { fetchAudioStream, stopAudioStream, error: micError, produceAudio, stopProducingAudio, stream:micStream } = useAudio();
  const { fetchVideoStream, stopVideoStream, error: camError, produceVideo, stopProducingVideo, stream:camStream } = useVideo(); 
  const { joinRoom, leaveRoom } = useRoom();
  const { peers} = usePeers();
  useEffect(() => {
      // its preferable to use env vars to store projectId
      initialize('7pJkjKXWIJQpih8wHmsO5GHG2W-YKEv7');
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
   

  return (
    <div className={styles.mainContainer}>
      {isInitialized ? 'Hello World!' : 'Please initialize'}
      <h1>State Room</h1>
      <div className={styles.roomState}>Room State: {roomState.valueOf()}</div>
       
      <video
        id="camVideo"
        autoPlay
        playsInline
        muted
        className={styles.videoElement}
      />
      <audio
        id="micAudio"
        autoPlay
        // eslint-disable-next-line react/no-unknown-property
        playsInline
       // muted
        className={styles.audioElement}
      />   

      <div className="grid grid-cols-4">
          {Object.values(peers)
            .filter((peer) => peer.cam)
            .map((peer) => (
              <>
                role: {peer.role}
                <Video
                  key={peer.peerId}
                  peerId={peer.peerId}
                  track={peer.cam!}
                  debug    
                />
              </>
            ))}

          </div>    

        <button 
          disabled={!joinLobby.isCallable} 
          onClick={() => joinLobby('xey-rsqz-hxm')
        }>
          Join Lobby
        </button>
 
        {/* Mic */}
        <button disabled={!fetchAudioStream.isCallable} onClick={(event) => fetchAudioStream()}>
          FETCH_AUDIO_STREAM
        </button>
 
        {/* Webcam //(event) => fetchVideoStream() */}
        <button disabled={!fetchVideoStream.isCallable} onClick={(event) => fetchVideoStream()}>
          FETCH_VIDEO_STREAM
        </button>

        <button disabled={!joinRoom.isCallable} onClick={joinRoom}>
          JOIN_ROOM 
        </button>
 
        <button disabled={!leaveRoom.isCallable} onClick={leaveRoom}>
          LEAVE_ROOM 
        </button> 

        <button disabled={!produceVideo.isCallable} onClick={() => produceVideo(camStream)}>
          Produce Cam  
        </button>
 
 
        <button disabled={!stopProducingVideo.isCallable} onClick={stopProducingVideo}>
          Stop Producing Cam  
        </button>
 
        <button disabled={!stopProducingAudio.isCallable} onClick={stopProducingAudio}>
          Stop Producing Mic  
        </button>

        <Link href="/auditorio" target='blank'>
          <button>Auditorio</button>
        </Link>
      </div>
    );
  };
 