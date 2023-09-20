import { ReactNode, useEffect, useRef, useState } from 'react';
import styles from './styles.module.scss'
import { useHuddle01 } from '@huddle01/react';
import { Video, Audio } from '@huddle01/react/components';
import { useDisplayName } from "@huddle01/react/app-utils";
import { IPeer } from '@huddle01/react/dist/declarations/src/atoms/peers.atom';
import { useLobby, useAudio, useVideo, useRoom, useEventListener, usePeers, useAcl } from '@huddle01/react/hooks';

import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import { BsFillCameraVideoOffFill } from 'react-icons/bs';

export function Slider(){
  const { peers } = usePeers();  
  const { joinLobby } = useLobby(); 
  const { joinRoom } = useRoom(); 
  const videoRef = useRef<HTMLVideoElement | null>(null); 
  const audioRef = useRef<HTMLAudioElement | null>(null);  
  const responsive = {
    0: { items: 1 }, // Mostrar 1 slide em telas menores que 768px
    768: { items: 2 }, // Mostrar 2 slides em telas maiores que 768px
  };

  const [slides, setSlides] = useState<JSX.Element[]>([]); // Defina o tipo inicial como um array vazio de elementos JSX

  useEffect(() => {
    // Atualize os slides sempre que o estado dos peers mudar
    const newSlides = Object.values(peers)
      .filter((peer) => peer.role === 'coHost')
      .map((peer) => (
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
      ));
      
    setSlides(newSlides);
  }, [peers]);
  console.log("slides: ",slides) 
  return ( 
    <div className={styles.mainContainer}>
      <div className={styles.carouselContainer}>         
        <AliceCarousel
          responsive={responsive} 
          items={slides}
          disableDotsControls
        >
          <div className={styles.coHostCarousel}>{slides}</div> 
        </AliceCarousel>
      </div> 
      </div>  
  );
};




          