import styles from  './styles.module.scss'
import { useEffect, useRef, useState } from 'react';
import { useHuddle01 } from '@huddle01/react';
import { Video, Audio } from '@huddle01/react/components';
import { useDisplayName } from "@huddle01/react/app-utils";
import { useLobby, useAudio, useVideo, useRoom, usePeers, useAcl } from '@huddle01/react/hooks';
import { BsFillCameraVideoOffFill } from "react-icons/bs";
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface SliderProps { 
  meVideo: React.RefObject<HTMLVideoElement>;
  meAudio: React.RefObject<HTMLAudioElement>;
}

export function Slider({ meVideo, meAudio } : SliderProps){ 
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
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const slides = Object.values(peers)
  .filter((peer) => peer.role === 'coHost')
  .map((peer, peerId) => (    
    <div className={styles.coHostCarousel}> 
      <div key={peerId} className={styles.slickItem}>          
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
    slides.unshift(         
    <div className={styles.coHostCarousel}>    
        <div key={me.meId} className={styles.slickItem}>                 
          {meVideo.current ? 
            <video 
              ref={meVideo} 
              autoPlay 
              playsInline 
              muted 
              className={styles.videoPeers} 
            />
          : 
          <div className={styles.videoHostPlay}>
            <BsFillCameraVideoOffFill className={styles.cameraOff} />
          </div>
          }
        {meAudio && <audio ref={meAudio} autoPlay playsInline className="audioElement" />}     
        </div>
      </div> 
     
    );
  }
  
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
  }, []);

  return (
    <div className={styles.mainContainer}>
      
      {slides.length > 2?
        <button onClick={prevSlide} className={styles.carouselButton}>
          <FaChevronLeft />
        </button>
      :
      <></>
      }
        

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
        {slides.length > 2?
           <button onClick={nextSlide} className={styles.carouselButton}>
              <FaChevronRight />
           </button>
        : 
        <></>
        }  
        
            
    </div>

  );
};

