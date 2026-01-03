import "./Backdrop.css";

export interface BackdropProp {
  imageUrl: string;
}
export function Backdrop(porps: BackdropProp) {
  return (
    <>
      <div className="backdrop">
        {porps.imageUrl && (
          <img src={porps.imageUrl} className="backdrop-image" alt="Backdrop" />
        )}
      </div>
      <div className="background"></div>
    </>
  );
}
