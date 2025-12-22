import "./Backdrop.css";
export function Backdrop({ imageUrl }) {
  return (
    <>
      <div className="backdrop">
        {imageUrl && (
          <img src={imageUrl} className="backdrop-image" alt="Backdrop" />
        )}
      </div>
      <div className="background"></div>
    </>
  );
}
