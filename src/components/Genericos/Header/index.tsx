import Head from 'next/head'
import styles from './styles.module.scss'
import Image from 'next/image'
import logo from '../../../../public/images/logo.png.webp'
import Link from 'next/link'
import { useState } from 'react'
import { Divide as Hamburger } from 'hamburger-react'
import { toast } from 'react-toastify'
import { ConnectWallet } from "@thirdweb-dev/react";

async function openToast(e: any){
  e.preventDefault()
  toast.warning('Página em Construção')
}

interface NavbarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isOpen, toggleSidebar }) => {
  const navbarClassName = isOpen ? 'navbar' : 'navbar hidden';

  return(
    <div className={navbarClassName}>
    <Hamburger toggled={isOpen}
    size={parseInt("30")} rounded toggle={toggleSidebar} />
    </div>   
   )
}

export function Header() {
  const [isOpen, setOpen] = useState(false)

  const handleLinkClick = () => {
    setOpen(false);
  }; 

  return (
    <main className={styles.mainContainer}>
      <header className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <Link href="/">
            <Image src={logo} alt="iBEED logo" />
          </Link> 
        </div>
        <div className={styles.linksContainer}>
          <div className={styles.rightLinks}>
            <Link href="">
              <h2 className={styles.ibeedPlus} onClick={openToast}>iBEED PLUS</h2>
            </Link>
            <Link href="">
              <h2 className={styles.comunidade} onClick={openToast}>COMUNIDADE</h2>
            </Link>
            <Link href="">
              <h2 className={styles.souAluno} onClick={openToast}>SOU ALUNO</h2>
            </Link> 
          </div>
          <nav className={styles.navbar}>                
              <Navbar isOpen={isOpen} toggleSidebar={() => setOpen(!isOpen)} /> 
          </nav>
          <ConnectWallet btnTitle = " LOGIN COM WALLET " className={styles.login}/>
          {isOpen && (
              <div className={styles.sidebar}>
            <Link href="">
              <h2 className={styles.ibeedPlus} onClick={openToast}>iBEED PLUS</h2>
            </Link>
            <Link href="">
              <h2 className={styles.comunidade} onClick={openToast}>COMUNIDADE</h2>
            </Link>
            <Link href="">
              <h2 className={styles.souAluno} onClick={openToast}>SOU ALUNO</h2>
            </Link>     
          </div>
          )}
        </div>
      </header>
    </main>
  )
}
