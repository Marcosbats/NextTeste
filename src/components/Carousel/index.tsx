import styles from  './styles.module.scss'
import Link from 'next/link';
import { createRef, useEffect, useRef, useState } from 'react';
import { useHuddle01 } from '@huddle01/react';
import { Video, Audio } from '@huddle01/react/components';
import { useDisplayName } from "@huddle01/react/app-utils";
import { useLobby, useAudio, useVideo, useRoom, usePeers, useAcl, useEventListener } from '@huddle01/react/hooks';
import { Divide as Hamburger } from 'hamburger-react'
import { toast } from 'react-toastify'
import { LuUsers, LuUser } from "react-icons/lu";
import { HiOutlineVideoCamera, HiOutlineVideoCameraSlash} from "react-icons/hi2";
import { BsMic, BsMicMute,  BsTelephoneX, BsX, BsFillCameraVideoOffFill } from "react-icons/bs";
import { IoLogIn } from "react-icons/io5";
import { RiSpeakFill } from "react-icons/ri";
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import initializeFirebaseClient from '../../services/firebaseConnection'
import { addDoc, collection, doc, getDoc, getDocs, increment, setDoc, updateDoc } from 'firebase/firestore'
import { FaChevronCircleLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';


export function Slider(){ 
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
  .map((peer) => (
    <div className={styles.coHostCarousel}> 
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
    </div>
  ));
  if (me.role === 'coHost') {
    slides.push(      
    <div className={styles.coHostCarousel}> 
      <div key="me" className={styles.meItem}>
        { onplay ? (        
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.videoPeers}
          />
        ):(
          <div className={styles.videoHostPlay}>
           <BsFillCameraVideoOffFill className={styles.cameraOff} />
          </div>)}       
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          className={styles.audioElement}
        />
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
         
      <div className={styles.auditorioContainer}> 
      <button onClick={prevSlide} className={styles.carouselButton}>
            <FaChevronLeft />
          </button>
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
        <button onClick={nextSlide} className={styles.carouselButton}>
            <FaChevronRight />
          </button>
       
        
              
        
      </div>                
    </div>    
  );
};

