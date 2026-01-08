"use client";

import { initParticlesEngine, Particles } from "@tsparticles/react";
import { useEffect, useMemo, useState } from "react";
import { loadFull } from "tsparticles";

const ParticlesBackground = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => setIsReady(true));
  }, []);
  const options = useMemo(
    () => ({
      fullScreen: false,
      background: {
        color: "transparent",
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "repulse" as const,
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          repulse: {
            distance: 80,
            strength: 60,
          },
        },
      },
      particles: {
        color: {
          value: "#ffffffff",
        },
        links: {
          color: "#ffffffff",
          distance: 140,
          enable: true,
          opacity: 0.25,
          width: 1,
        },
        collisions: {
          enable: false,
        },
        move: {
          direction: "none" as const,
          enable: true,
          outModes: {
            default: "bounce" as const,
          },
          random: false,
          speed: 0.6,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 400,
          },
          value: 80,
        },
        opacity: {
          value: 0.4,
        },
        shape: {
          type: "square" as const
        },
        size: {
          value: { min: 1, max: 3 },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!isReady) {
    return null;
  }

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <Particles id="nbx-particles" options={options} className="size-full" />
    </div>
  );
};

export default ParticlesBackground;
