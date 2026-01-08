import "./FilePreview.css";

export function FilePreview({ base64data, onRemove }) {
  const renderContent = () => {
    if (!base64data || typeof base64data !== "string") {
      return <div className="status-text">Không xác định (Dữ liệu rỗng)</div>;
    }
    if (base64data.startsWith("data:image")) {
      return (
        <img
          src={base64data}
          alt="File Preview"
          className="preview-item preview-img"
        />
      );
    }
    if (base64data.startsWith("data:video")) {
      return (
        <video controls className="preview-item preview-video">
          <source src={base64data} />
          Trình duyệt của bạn không hỗ trợ xem video này.
        </video>
      );
    }

    return (
      <div className="status-text">Không xác định (Định dạng không hỗ trợ)</div>
    );
  };

  return (
    <>
      <div className="preview-zone">
        <button className="remove-btn" onClick={onRemove} title="Xóa file">
          X
        </button>
        {renderContent()}
      </div>
    </>
  );
}
