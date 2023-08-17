import styles from  './styles.module.scss'
import { useHuddle01 } from '@huddle01/react';
import { Video, Audio } from '@huddle01/react/components';
import { useLobby, useRoom, usePeers } from '@huddle01/react/hooks';
import { useEffect } from 'react';

export function Auditorio(){ 
  const { initialize, isInitialized, roomState } = useHuddle01();
  const { joinLobby } = useLobby();  
  const { joinRoom, leaveRoom } = useRoom();
  const { peers} = usePeers();

  useEffect(() => {
      // its preferable to use env vars to store projectId
      initialize('7pJkjKXWIJQpih8wHmsO5GHG2W-YKEv7');
      joinLobby('xey-rsqz-hxm'); 
      
    }, []);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.Video}>
        {Object.values(peers)
          .filter((peer) => peer.cam)
          .map((peer) => (
            <>              
              <Video
                key={peer.peerId}
                peerId={peer.peerId}
                track={peer.cam!}
                debug    
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
      <div className={styles.btnAuditorio}>
        <button disabled={!joinRoom.isCallable} onClick={joinRoom}>
          JOIN_ROOM 
        </button>
 
        <button disabled={leaveRoom.isCallable} onClick={leaveRoom}>
          LEAVE_ROOM 
        </button> 
      </div>
    </div>
  );
};
 