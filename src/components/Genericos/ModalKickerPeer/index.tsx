import Link from 'next/link';
import styles from './styles.module.scss'
import { useHuddle01, useRoom } from '@huddle01/react/hooks';

interface ModalProps {
    onClose: () => void;       
}

export function ModalKickerPeer({ onClose }: ModalProps) {
  const { endRoom} = useRoom();
  const { roomState } = useHuddle01();

  return (
    <main className={styles.modalContainer}>
      <div className={styles.modalContent}>
        <p>Sua Conexão com a Sala foi Encerrada</p>            
        <div className={styles.linkContainer}>
         <Link href='https://ibeed.xyz/comunidade' onClick={onClose}>IR PARA COMUNIDADE</Link>
        </div>
      </div>
    </main>
  );
};