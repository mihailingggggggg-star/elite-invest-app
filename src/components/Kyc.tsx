import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Webcam from "react-webcam";
import { useDropzone } from "react-dropzone";
import { Ring } from "ldrs/react";
import "ldrs/react/Ring.css";
import { useApp, useT } from "../lib/app";
import { ui } from "../lib/data";
import { MarkEsmar } from "./Logo";
import { Seg } from "./Seg";
import { IcBack, IcCamera, IcCard, IcCheck, IcClock, IcRefresh, IcShield, IcUpload } from "./Icons";

/**
 * Проверка личности (KYC) — полная эмуляция: данные, съёмка документа,
 * селфи с проверкой живости и финальная проверка.
 *
 * Камера — react-webcam (github.com/mozmorris/react-webcam, MIT).
 * Загрузка файла с устройства — react-dropzone
 * (github.com/react-dropzone/react-dropzone, MIT).
 * Если камера недоступна или доступ запрещён, шаг остаётся рабочим:
 * остаётся загрузка готового снимка.
 */

type Step = "intro" | "data" | "doc" | "selfie" | "check" | "ok";

const ORDER: Step[] = ["data", "doc", "selfie", "check"];

export function Kyc({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const t = useT();
  const { verify } = useApp();

  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [docType, setDocType] = useState<"passport" | "id">("passport");
  const [docShot, setDocShot] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [camError, setCamError] = useState(false);

  const stepIndex = ORDER.indexOf(step);

  const back = () => {
    if (step === "intro") return onClose();
    setStep(step === "ok" ? "selfie" : ORDER[Math.max(0, stepIndex - 1)]);
  };

  return (
    <motion.div
      className="kyc"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      role="dialog"
      aria-modal="true"
      aria-label={t(ui.kycTitle)}
    >
      <div className="kyc__top">
        <button className="kyc__back" onClick={back} aria-label={t(ui.back)}>
          <IcBack size={20} />
        </button>
        <span className="kyc__title">{t(ui.kycTitle)}</span>
        <span style={{ width: 38 }} />
      </div>

      {stepIndex >= 0 && (
        <div className="kyc__steps" aria-hidden>
          {ORDER.map((s, i) => (
            <span key={s} data-on={i <= stepIndex} data-done={i < stepIndex}>
              <i />
            </span>
          ))}
        </div>
      )}

      <div className="kyc__body">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="kyc__pane"
          >
            {step === "intro" && <Intro onStart={() => setStep("data")} />}

            {step === "data" && (
              <DataStep
                name={name}
                birth={birth}
                onName={setName}
                onBirth={setBirth}
                onNext={() => setStep("doc")}
              />
            )}

            {step === "doc" && (
              <DocStep
                docType={docType}
                setDocType={setDocType}
                shot={docShot}
                setShot={setDocShot}
                camError={camError}
                setCamError={setCamError}
                onNext={() => setStep("selfie")}
              />
            )}

            {step === "selfie" && (
              <SelfieStep
                shot={selfie}
                setShot={setSelfie}
                camError={camError}
                setCamError={setCamError}
                onNext={() => setStep("check")}
              />
            )}

            {step === "check" && (
              <CheckStep
                onDone={() => {
                  verify(name.trim() || t(ui.kycNamePh));
                  setStep("ok");
                }}
              />
            )}

            {step === "ok" && <OkStep onDone={onDone} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */

function Intro({ onStart }: { onStart: () => void }) {
  const t = useT();
  return (
    <div className="kyc__intro">
      <span className="kyc__hero" aria-hidden>
        <IcShield size={40} />
      </span>
      <h3 className="kyc__h">{t(ui.kycTitle)}</h3>
      <p className="kyc__p">{t(ui.kycWhy)}</p>

      <div className="kyc__need">
        <span>
          <IcCard size={18} /> {t(ui.kycNeed1)}
        </span>
        <span>
          <IcCamera size={18} /> {t(ui.kycNeed2)}
        </span>
        <span>
          <IcClock size={18} /> {t(ui.kycNeed3)}
        </span>
      </div>

      <button className="btn btn--p" onClick={onStart}>
        {t(ui.kycStart)}
      </button>
      <p className="kyc__fine">{t(ui.kycAgree)}</p>
      <p className="kyc__fine kyc__fine--dim">{t(ui.kycDemo)}</p>
    </div>
  );
}

function DataStep({
  name,
  birth,
  onName,
  onBirth,
  onNext,
}: {
  name: string;
  birth: string;
  onName: (v: string) => void;
  onBirth: (v: string) => void;
  onNext: () => void;
}) {
  const t = useT();
  const ok = name.trim().length >= 4 && /^\d{4}-\d{2}-\d{2}$/.test(birth);

  return (
    <div className="kyc__form">
      <h3 className="kyc__h">{t(ui.kycData)}</h3>

      <label className="field">
        <span>{t(ui.kycName)}</span>
        <input value={name} onChange={(e) => onName(e.target.value)} placeholder={t(ui.kycNamePh)} autoComplete="name" />
      </label>

      <label className="field">
        <span>{t(ui.kycBirth)}</span>
        <input
          value={birth}
          onChange={(e) => onBirth(e.target.value)}
          type="date"
          max="2008-01-01"
          min="1930-01-01"
        />
      </label>

      <div className="kyc__fine kyc__fine--dim">{t(ui.kycDemo)}</div>

      <button className="btn btn--p" disabled={!ok} onClick={onNext}>
        {t(ui.confirm)}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CameraBox({
  facing,
  onShot,
  onError,
  guide,
  oval,
}: {
  facing: "user" | "environment";
  onShot: (dataUrl: string) => void;
  onError: () => void;
  guide: string;
  oval?: boolean;
}) {
  const t = useT();
  const cam = useRef<Webcam>(null);
  const constraints = useMemo(() => ({ facingMode: facing, width: 1280, height: 960 }), [facing]);

  return (
    <div className="cam">
      <Webcam
        key={facing}
        ref={cam}
        className="cam__video"
        videoConstraints={constraints}
        screenshotFormat="image/jpeg"
        screenshotQuality={0.9}
        mirrored={facing === "user"}
        onUserMediaError={onError}
        playsInline
        muted
      />
      <span className={`cam__frame ${oval ? "cam__frame--oval" : ""}`} aria-hidden />
      <span className="cam__scan" aria-hidden />
      <span className="cam__guide">{guide}</span>
      <button
        className="cam__shoot"
        onClick={() => {
          const url = cam.current?.getScreenshot() ?? null;
          if (url) onShot(url);
          else onError();
        }}
        aria-label={t(ui.kycShoot)}
      >
        <IcCamera size={22} />
      </button>
    </div>
  );
}

function UploadBox({
  onPick,
  label,
}: {
  onPick: (url: string) => void;
  label: string;
}) {
  const t = useT();
  const onDrop = useCallback(
    (files: File[]) => {
      const f = files[0];
      if (f) onPick(URL.createObjectURL(f));
    },
    [onPick]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <div className="drop" data-on={isDragActive} {...getRootProps()}>
      <input {...getInputProps()} />
      <IcUpload size={22} />
      <b>{label}</b>
      <span>{t(ui.kycDrop)}</span>
    </div>
  );
}

function DocStep({
  docType,
  setDocType,
  shot,
  setShot,
  camError,
  setCamError,
  onNext,
}: {
  docType: "passport" | "id";
  setDocType: (v: "passport" | "id") => void;
  shot: string | null;
  setShot: (v: string | null) => void;
  camError: boolean;
  setCamError: (v: boolean) => void;
  onNext: () => void;
}) {
  const t = useT();

  return (
    <div className="kyc__form">
      <h3 className="kyc__h">{t(ui.kycDoc)}</h3>

      <Seg
        name="kyc-doc"
        value={docType}
        onChange={setDocType}
        options={[
          { v: "passport" as const, label: t(ui.kycPassport) },
          { v: "id" as const, label: t(ui.kycId) },
        ]}
      />

      {shot ? (
        <div className="shot">
          <img src={shot} alt="" />
          <button className="shot__retake" onClick={() => setShot(null)}>
            <IcRefresh size={15} /> {t(ui.kycRetake)}
          </button>
        </div>
      ) : camError ? (
        <UploadBox onPick={setShot} label={t(ui.kycUpload)} />
      ) : (
        <CameraBox facing="environment" guide={t(ui.kycDocHint)} onShot={setShot} onError={() => setCamError(true)} />
      )}

      {!shot && !camError && (
        <div className="kyc__alt">
          <button className="linkbtn" onClick={() => setCamError(true)}>
            <IcUpload size={15} /> {t(ui.kycUpload)}
          </button>
        </div>
      )}
      {camError && <div className="note note--dim">{t(ui.kycCameraOff)}</div>}

      <button className="btn btn--p" disabled={!shot} onClick={onNext}>
        {t(ui.confirm)}
      </button>
    </div>
  );
}

function SelfieStep({
  shot,
  setShot,
  camError,
  setCamError,
  onNext,
}: {
  shot: string | null;
  setShot: (v: string | null) => void;
  camError: boolean;
  setCamError: (v: boolean) => void;
  onNext: () => void;
}) {
  const t = useT();

  return (
    <div className="kyc__form">
      <h3 className="kyc__h">{t(ui.kycSelfie)}</h3>

      {shot ? (
        <div className="shot shot--oval">
          <img src={shot} alt="" />
          <button className="shot__retake" onClick={() => setShot(null)}>
            <IcRefresh size={15} /> {t(ui.kycRetake)}
          </button>
        </div>
      ) : camError ? (
        <UploadBox onPick={setShot} label={t(ui.kycUpload)} />
      ) : (
        <CameraBox facing="user" oval guide={t(ui.kycSelfieHint)} onShot={setShot} onError={() => setCamError(true)} />
      )}

      {camError && <div className="note note--dim">{t(ui.kycCameraOff)}</div>}

      <button className="btn btn--p" disabled={!shot} onClick={onNext}>
        {t(ui.confirm)}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const CHECKS: { ru: string; ky: string }[] = [
  { ru: "Данные совпадают с документом", ky: "Маалыматтар документ менен дал келет" },
  { ru: "Качество снимка достаточно", ky: "Сүрөттүн сапаты жетиштүү" },
  { ru: "Лицо сверено с селфи", ky: "Бет селфи менен салыштырылды" },
];

function CheckStep({ onDone }: { onDone: () => void }) {
  const t = useT();
  const { lang } = useApp();
  const [done, setDone] = useState(0);

  useEffect(() => {
    const ids = [
      window.setTimeout(() => setDone(1), 700),
      window.setTimeout(() => setDone(2), 1400),
      window.setTimeout(() => setDone(3), 2100),
      window.setTimeout(onDone, 2600),
    ];
    return () => ids.forEach(window.clearTimeout);
  }, [onDone]);

  return (
    <div className="kyc__check">
      <Ring size={54} stroke={3} color="var(--brand-lit)" bgOpacity={0.18} />
      <h3 className="kyc__h">{t(ui.kycChecking)}</h3>
      <p className="kyc__p">{t(ui.kycCheckingSub)}</p>

      <div className="kyc__list">
        {CHECKS.map((c, i) => (
          <div className="kyc__row" key={i} data-on={done > i}>
            <span className="kyc__dot">{done > i ? <IcCheck size={12} /> : <i />}</span>
            {c[lang]}
          </div>
        ))}
      </div>
    </div>
  );
}

function OkStep({ onDone }: { onDone: () => void }) {
  const t = useT();
  return (
    <div className="kyc__ok">
      <motion.span
        className="seal seal--lg"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 15 }}
      >
        <MarkEsmar size={34} />
        <i>
          <IcCheck size={13} />
        </i>
      </motion.span>
      <h3 className="kyc__h">{t(ui.kycOk)}</h3>
      <p className="kyc__p">{t(ui.kycOkText)}</p>
      <button className="btn btn--p" onClick={onDone}>
        {t(ui.kycContinue)}
      </button>
    </div>
  );
}
