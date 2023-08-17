import Head from 'next/head';
import { FaYoutube, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { MdSailing } from 'react-icons/md'
import styles from './styles.module.scss'
import Image from 'next/image'
import logo from '../../../../public/images/logo.png.webp'
import opensea from '../../../../public/images/OpenSea.png'
import Link from 'next/link';

export function Footer(){
    return(
        <main className={styles.mainContainer}>
            <div className={styles.containerFooter}>
                <div className={styles.contentFooter}>
                    <section className={styles.Social}>
                        <Image src={logo} alt="Logo iBEED" />
                        <Link href="https://twitter.com/ibeedxyz" target='_blank'><FaTwitter size={22} /></Link>
                        <Link href="https://www.instagram.com/ibeedxyz/" target='_blank'><FaInstagram size={22} /></Link>
                        <Link href="https://www.linkedin.com/company/ibeedxyz/" target='_blank'><FaLinkedin size={22} /></Link>
                        <Link href="https://www.youtube.com/@ibeed" target='_blank'><FaYoutube size={22} /></Link>
                        <Link href="https://opensea.io/collection/ibeed-world-cup-catar-2022" target='_blank'><Image src={opensea}  alt='Logo OpenSea' className={styles.logopensea}/></Link>
                    </section>
                    <section className={styles.termos}>
                        <Link href="/termos-privacidade">Termos de Privacidade</Link>
                        <Link href="/termos-uso">Termos de Uso</Link>
                    </section>          
                </div>
                <section className={styles.cnpj}>
                    <p>© 2023 iBEED. Todos os direitos reservados – CNPJ 48.057.536/0001-70</p>
                </section>     
            </div>
        </main>   
    )
}