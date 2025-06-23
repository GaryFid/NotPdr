import { MainMenu } from '../components/main_menu_component';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>P.I.D.R. - Card Game</title>
        <link rel="stylesheet" href="/css/style.css" />
      </Head>
      <div className="container">
        <MainMenu onNavigate={() => {}} />
      </div>
    </>
  );
}
