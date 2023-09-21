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
  const { me } = useHuddle01();
  const videoRef = useRef<HTMLVideoElement | null>(null); 
  const audioRef = useRef<HTMLAudioElement | null>(null);  
  const responsive = {
    0: { items: 1 }, // Mostrar 1 slide em telas menores que 768px
    768: { items: 2 }, // Mostrar 2 slides em telas maiores que 768px
  };
   
          
  const slides = [];

  // Filtrar e adicionar elementos que atendam à primeira condição
  slides.push(
    ...Object.values(peers)
      .filter((peer) => peer.cam)
      .map((peer) => (
        <div key={peer.peerId} className={styles.slickItem}>
          <Video
            className={styles.videoPeers}
            peerId={peer.peerId}
            track={peer.cam!}
          />
          {peer.mic && (
            <Audio
              peerId={peer.peerId}
              track={peer.mic!}
            />
          )}
        </div>
      ))
  );
  
  // Filtrar e adicionar elementos que atendam à segunda condição
  slides.push(
    ...Object.values(peers)
      .filter((peer) => peer.role === 'coHost' && !peer.cam)
      .map((peer) => (
        <div key={peer.peerId} className={styles.slickItem}>
          <div className={styles.videoHostPlay}>
            <BsFillCameraVideoOffFill className={styles.cameraOff} />
          </div>
        </div>
      ))
  );
  
  // Adicionar a terceira opção (se aplicável)
  if (me.role === 'coHost') {
    slides.push(
      <div key="me" className={styles.meItem}>
        {videoRef ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.videoPeers}
          />
        ) : (
          <div className={styles.videoHostPlay}>
            <BsFillCameraVideoOffFill className={styles.cameraOff} />
          </div>
        )}
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          className={styles.audioElement}
        />
      </div>
    );
  }

  useEventListener("room:peer-role-update", () => {
    
    console.log("room:peer-role-update")
  })
 

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




          