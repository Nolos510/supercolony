export function Icon({ name, size = 20 }: { name: 'world' | 'book' | 'leaf' | 'arrow' | 'pause' | 'play' | 'close' | 'reset' | 'ship' | 'zoom'; size?: number }) {
  const paths = {
    world: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c5 6 5 12 0 18-5-6-5-12 0-18M5 7h14M5 17h14" /></>,
    book: <><path d="M12 6C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2v15" /></>,
    leaf: <><path d="M20 3C5 2 1 12 6 17s15 1 14-14ZM5 20 16 8" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    pause: <><path d="M8 5v14M16 5v14" strokeWidth="3" /></>,
    play: <path d="m8 4 12 8-12 8Z" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    reset: <><path d="M3 11a9 9 0 1 1 2 7M3 4v7h7" /></>,
    ship: <><path d="m3 14 9 6 9-6-9-3ZM7 12V5h10v7M12 5V2M3 22l3-1 3 1 3-1 3 1 3-1 3 1" /></>,
    zoom: <><circle cx="10" cy="10" r="7" /><path d="m15 15 6 6M7 10h6m-3-3v6" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
