import React, { useEffect } from 'react'
import Link from 'next/link'
import styles from './styles.module.scss'
import { useState } from 'react'
import { useDisplayName } from "@huddle01/react/app-utils";
import { useHuddle01, useRoom } from '@huddle01/react/hooks';
import { Loading } from '../../Genericos/Loading'
import { toast } from 'react-toastify';

interface ModalProps {
    onClose: () => void; 
    onNameSubmit: (name: string) => void;    
}

export function ModalAuditorio({ onClose, onNameSubmit }: ModalProps) {
  const { setDisplayName, error: displayNameError } = useDisplayName();
  const [displayNameText, setDisplayNameText] = useState(" ");
  const { joinRoom} = useRoom();
  const { roomState } = useHuddle01();

   const handleRoomButtonClick = () => {
    if (roomState.valueOf() === 'LOBBY') {
      try {
        joinRoom();
      } catch (error) {
        console.error('Erro:', error);
      }
    } else if  (roomState.valueOf() === 'ROOM') {
     
      if (displayNameText.trim() === '') {
        toast.error('Nome não pode estar em branco.');
        setDisplayNameText('');
      } else if (displayNameText.length < 5) {
        toast.error('Nome deve ter pelo menos 5 caracteres.');
        setDisplayNameText('');
      } else if (displayNameText.length > 8) {
        toast.error('Nome deve ter no máximo 8 caracteres.');
        setDisplayNameText('');
      } else if (/(.)\1\1/.test(displayNameText)) {
        toast.error('Nome não pode conter três caracteres iguais seguidos.');
        setDisplayNameText('');
      }
       else {
        // O nome é válido, execute a lógica de sucesso
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

  return (
    <main className={styles.modalContainer}>
      <div className={styles.modalContent}>
      {roomState === "ROOM" ? (
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
      ) : null}         
        <button
          disabled={!joinRoom.isCallable && !setDisplayName.isCallable  }
          onClick={handleRoomButtonClick}
        >
          {buttonLabelRoom()}
        </button>       
      </div>
    </main>
  );
};