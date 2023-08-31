import styles from './styles.module.scss'

export function Loading(){

    return(
    <div className={styles.spinner}>
        <div className={styles.center}>
            <div className={styles.spinnerBlade}></div>
            <div className={styles.spinnerBlade}></div>
            <div className={styles.spinnerBlade}></div>
            <div className={styles.spinnerBlade}></div>
            <div className={styles.spinnerBlade}></div>
            <div className={styles.spinnerBlade}></div>
            <div className={styles.spinnerBlade}></div>
            <div className={styles.spinnerBlade}></div>
            <div className={styles.spinnerBlade}></div>
            <div className={styles.spinnerBlade}></div>
            <div className={styles.spinnerBlade}></div>
            <div className={styles.spinnerBlade}></div>
        </div>
    </div>

    )}
    