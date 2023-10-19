import styles from  './styles.module.scss'
import { useEffect, useRef, useState } from 'react';
import { useHuddle01 } from '@huddle01/react';
import { Video, Audio } from '@huddle01/react/components';
import { usePeers } from '@huddle01/react/hooks';
import { BsFillCameraVideoOffFill } from "react-icons/bs";
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import initializeFirebaseClient from '../../services/firebaseConnection'
import { collection, doc, getDocs, setDoc, } from 'firebase/firestore'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface SliderProps { 
  meVideo: React.RefObject<HTMLVideoElement>;
  meAudio: React.RefObject<HTMLAudioElement>;
}

export function Slider({ meVideo, meAudio } : SliderProps){ 
  const { initialize } = useHuddle01();
  const { peers } = usePeers();
  const { me } = useHuddle01();
  const videoRef = useRef<HTMLVideoElement | null>(null); 
  const audioRef = useRef<HTMLAudioElement | null>(null);
	const { db } = initializeFirebaseClient()
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
  
  async function getNextRoomName() {
    const querySnapshot = await getDocs(collection(db, 'auditorio'));
    const roomNames = querySnapshot.docs.map((doc) => doc.id);
  
    const highestNumber = roomNames.reduce((max, roomName) => {
      const match = roomName.match(/^Sala (\d+)$/);

      if (match) {
        const number = parseInt(match[1]);
        return number > max ? number : max;
      }
      return max;
      
    }, 0);
  
    const nextRoomNumber = highestNumber + 1;
    console.log('ultima sala: ', highestNumber);
    return `Sala ${nextRoomNumber}`;
  }

  async function createNewRoom() {
    const roomName = await getNextRoomName();
  
    try {
      const userBase = doc(db, "auditorio", roomName)
      
      const currentDate = new Date();
      const roomId = sessionStorage.getItem('roomId');
      
      const userData = {
        name: "Call", 
        date: currentDate,  
        roomId: roomId,   
        coHost: 0,     
        
      }
      await setDoc(userBase, userData)
      console.log('Documento criado com ID: ', userBase.id);
      
      return roomName;
    } catch (error) {
      console.error('Erro ao criar documento: ', error);
    }
  }
 
  
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

