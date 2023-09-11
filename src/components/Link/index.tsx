import Link from "next/link";
import { useAuthContext } from '../../contexts/auth';


export function Entre(){  
  const { id } : any = useAuthContext();
  console.log('ID acessado na página Auditorio:', id);


  return(
    <div>
      <Link href="/auditorio" target='blank' passHref>
      ENTRAR NO EVENTO
      </Link>
      <p>Aqui:{id}</p>
    </div>

  )
};

