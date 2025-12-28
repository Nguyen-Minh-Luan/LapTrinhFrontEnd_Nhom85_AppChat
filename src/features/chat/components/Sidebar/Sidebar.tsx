import React from 'react';
import styles from './Sidebar.module.css';

export const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <img src="/whatsapp-logo.png" width="30" alt="logo" />
        <div className={styles.headerIcons}>
          <span>➕</span> <span>📝</span> <span>⚙️</span>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <input className={styles.searchBar} placeholder="Search chat or contact..." />
      </div>

      {/* List */}
      <div className={styles.list}>
        {/* Item đang Active */}
        <div className={`${styles.item} ${styles.activeItem}`}>
          <div className={styles.avatarWrapper}>
            <img src="https://via.placeholder.com/50" className={styles.avatar} />
            <span className={styles.onlineBadge}></span>
          </div>
          <div className={styles.content}>
            <div className={styles.topRow}>
              <span className={styles.name}>Half-Life 3</span>
              <span className={styles.time}>14:56</span>
            </div>
            <div className={styles.msgRow}>
              <p className={styles.lastMsg}>Gabe writes a message...</p>
              <span>⭐</span>
            </div>
          </div>
        </div>

        {/* Thêm các item khác... */}
      </div>
    </div>
  );
};