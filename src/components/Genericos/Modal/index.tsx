import React, { useEffect } from 'react'
import Link from 'next/link'
import styles from './styles.module.scss'
import { useState } from 'react'
import { useDisplayName } from "@huddle01/react/app-utils";
import { useHuddle01, useRoom } from '@huddle01/react/hooks';
import { Loading } from '../../Genericos/Loading'
import { toast } from 'react-toastify';
import { ConnectWallet, useAddress } from '@thirdweb-dev/react';
import { collection, getDocs, limit, orderBy,query } from 'firebase/firestore';
import initializeFirebaseClient from '@/src/services/firebaseConnection';

interface ModalProps {
    onClose: () => void; 
    onNameSubmit: (name: string) => void;    
}

export function ModalAuditorio({ onClose, onNameSubmit }: ModalProps) {
  const { setDisplayName, error: displayNameError } = useDisplayName();
  const [displayNameText, setDisplayNameText] = useState(" ");
  const { joinRoom} = useRoom();
  const { roomState } = useHuddle01();
  const address = useAddress();  
  const { db } = initializeFirebaseClient();  
  const [loading, setLoading] = useState(true);
  const [stateRoom, setStateRoom] = useState(null);


   const handleRoomButtonClick = () => {
    if (roomState.valueOf() === 'LOBBY') {
      try {
        joinRoom();
      } catch (error) {
        console.error('Erro:', error);
      }
    } else if (roomState.valueOf() === 'ROOM') {
     
      if (displayNameText.trim() === '') {
        toast.error('Nome não pode estar em branco.');
        setDisplayNameText('');
      } else if (displayNameText.length < 3) {
        toast.error('Nome deve ter pelo menos 3 caracteres.');
        setDisplayNameText('');
      } else if (displayNameText.length > 8) {
        toast.error('Nome deve ter no máximo 8 caracteres.');
        setDisplayNameText('');
      } else if (/(.)\1\1/.test(displayNameText)) {
        toast.error('Nome não pode conter três caracteres iguais seguidos.');
        setDisplayNameText('');
      }
       else {
        onNameSubmit(displayNameText);
        setDisplayName(displayNameText);
        onClose();
      }
    }
   };

  const buttonLabelRoom = () => {
    if (roomState === 'INIT') {
      return (
        <>
          <Loading /> 
        </>
      );
    } else if (roomState === 'LOBBY') {
      return 'ENTRAR NA SALA';
    } else if (roomState === 'ROOM') {
      return 'CADASTRE SEU NOME';
    }  
  };

  async function fetchCurrentRoomData() {
    const collectionRef = collection(db, "auditorio");

    // Consulta os documentos ordenados por um campo (por exemplo, data) em ordem decrescente
    const resultado = query(collectionRef, orderBy("date", "desc"), limit(1));

    try {
      const querySnapshot = await getDocs(resultado);
      if (!querySnapshot.empty) {
        // Obtem o documento encontrado
        const document = querySnapshot.docs[0].data();
        return document;
      } else {
        console.log("Nenhum documento encontrado na coleção 'auditorio'.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar o último documento: ", error);
      return null;
    }
  }
 
   useEffect(() => {
    async function fetchData() {
      const lastRoomData = await fetchCurrentRoomData();

      if (lastRoomData) {
        const stateRoom = lastRoomData.stateRoom;
        setStateRoom(stateRoom);
        setLoading(false); // Defina o estado de carregamento como falso após obter os dados
      }
    }

    fetchData();
  }, [])

  return (
    <main className={styles.modalContainer}>
      <div className={styles.modalContent}>
        {roomState === "ROOM" ? 
          <React.Fragment>
            <h2>Insira seu nome</h2>
            <input
              type="text"
              placeholder=" Digite seu Nome"
              value={displayNameText}
              onChange={(e) => setDisplayNameText(e.target.value)}
              className={styles.inputContainer}
            />
          </React.Fragment>
        : null}   

        {loading ? 
          <Loading />           

        : stateRoom === "open" ?
            
          <button
            disabled={!joinRoom.isCallable && !setDisplayName.isCallable}
            onClick={handleRoomButtonClick}
          >
            {buttonLabelRoom()}
          </button> 
        
        : 
          <p>A Live não está aberta no momento</p>
        }

      </div>
    </main>
  );
};