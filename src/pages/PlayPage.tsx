import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HUB_INDEX, StackProvider, useStackStore } from "../stack";

export function PlayPage() {
  const navigate = useNavigate();
  const currentIndex = useStackStore((s) => s.currentIndex);

  useEffect(() => {
    useStackStore.setState({
      currentIndex: 0,
      phase: "PLAYING",
      memoryVisible: false,
    });
  }, []);

  useEffect(() => {
    if (currentIndex === HUB_INDEX) {
      navigate("/portfolio", { replace: true });
    }
  }, [currentIndex, navigate]);

  return <StackProvider />;
}
