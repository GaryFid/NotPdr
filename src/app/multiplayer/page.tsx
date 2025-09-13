'use client';

import { useRouter } from 'next/navigation';
import ProfessionalMultiplayer from '../../components/ProfessionalMultiplayer';

export default function MultiplayerPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return <ProfessionalMultiplayer onBack={handleBack} />;
}