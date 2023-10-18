//https://next-teste-mh74.vercel.app/
import { AppProps } from 'next/app'
import '../styles/global.scss'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { ThirdwebProvider, metamaskWallet,  coinbaseWallet,  walletConnect } from "@thirdweb-dev/react"
import { Polygon } from "@thirdweb-dev/chains";
//import { AuthProvider } from '../contexts/auth';

export default function App({
  Component, pageProps: { session, ...pageProps }
}: AppProps) {
   return (
    
      <ThirdwebProvider
        supportedWallets={[
          metamaskWallet(),
          coinbaseWallet(),
          walletConnect({
            projectId: "08b445ecbd8f782a4634a4efef0b700c"
          }),
        ]}
        activeChain={Polygon}
        clientId="JbArIwMfUBGW_HnQmNGaIaGqVrSt5xIn"
        autoConnect={false}>
               
          <ToastContainer autoClose={3000}/> 
                     
            <Component {...pageProps}/> 
             
      </ThirdwebProvider>       
  )
}
