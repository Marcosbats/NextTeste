import Head from 'next/head'
import styles from './styles.module.scss'
import { Auditorio } from '../../components/Auditorio'
import { Header } from '../../components/Genericos/Header'
import { Footer } from '../../components/Genericos/Footer'
import { Slider } from '../../components/Carousel'

export default function Call(){
  
  return (
    <div className={styles.container}>
      <Head>
        <title>iBEED</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta content="#61D5A0" name="theme-color"></meta>
        <meta property="og:title" content="Linkeh"></meta>
        <meta property="og:site_name" content="linkeh"></meta>
        <meta property="og:url" content="https://www.linkeh.xyz/"></meta>
        <meta property="og:description" content="Linkeh, the perfect place for you to gather all your main links, but with a small and big difference, linked to your web3 identity."></meta>
        <meta property="og:type" content="website"></meta>
        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/linkeh-3c343.appspot.com/o/foto4.png?alt=media&token=ce45a887-ed5a-48b1-9772-91fa8a0e422b"></meta>
        <meta property="description" content="Linkeh, the perfect place for you to gather all your main links, but with a small and big difference, linked to your web3 identity."/>
        <meta property="twitter:description" content="Linkeh, the perfect place for you to gather all your main links, but with a small and big difference, linked to your web3 identity."></meta>
        <meta property="twitter:title" content="Linkeh"></meta>
        <meta property="twitter:image" content="https://firebasestorage.googleapis.com/v0/b/linkeh-3c343.appspot.com/o/foto4.png?alt=media&token=ce45a887-ed5a-48b1-9772-91fa8a0e422b"></meta>
        <meta property="twitter:card" content="summary_large_image"></meta>
      </Head>
      
      <main className={styles.mainContainer}>
          <Header />            
          <Auditorio />
          <Slider />         
          <Footer />        
      </main>      
    </div>
  )
}