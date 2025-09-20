import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthContext } from '@/contexts/authContext';
import MainNavigation from "@/components/layout/MainNavigation";
import Home from "@/pages/Home";
import CombatPowerEquipment from "@/pages/CombatPowerEquipment";
import CharacterCreation from "@/pages/CharacterCreation";

import MarginalBenefitAnalysis from "@/pages/MarginalBenefitAnalysis";
import EquipmentComparison from "@/pages/EquipmentComparison";
import LotterySimulation from "@/pages/LotterySimulation";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <MainNavigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/combat-power-equipment" element={<CombatPowerEquipment />} />
            <Route path="/character-creation" element={<CharacterCreation />} />


            <Route path="/marginal-benefit-analysis" element={<MarginalBenefitAnalysis />} />
            <Route path="/equipment-comparison" element={<EquipmentComparison />} />
            <Route path="/lottery-simulation" element={<LotterySimulation />} />
          </Routes>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
