import { motion } from "motion/react";
import { X, Download, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { toPng } from "html-to-image";

interface QRTicketProps {
  eventId: string;
  userId: string;
  ticketId: string;
  qrSignature?: string;
  eventName: string;
  runnerName: string;
  bibNumber: string;
  distance: string;
  date: string;
  location: string;
  onClose: () => void;
}

export function QRTicket({
  eventId,
  userId,
  ticketId,
  qrSignature,
  eventName,
  runnerName,
  bibNumber,
  distance,
  date,
  location,
  onClose,
}: QRTicketProps) {
  const qrPayload = JSON.stringify({
    type: 'DTBM_EVENT_TICKET',
    eventId,
    userId,
    ticketId,
    qrSignature: qrSignature || '',
    eventName,
    runnerName,
    bibNumber,
    distance,
    date,
    location,
  });

  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    const dataUrl = await toPng(ticketRef.current, { cacheBust: true, pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `${eventName.replace(/\s+/g, '-').toLowerCase()}-ticket.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>

        {/* Ticket */}
        <div ref={ticketRef} className="relative bg-gradient-to-br from-[#121212] to-[#0A0A0A] rounded-3xl overflow-hidden border-2 border-[#FF3B30]">
          {/* Grid Pattern Background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

          {/* Glow Effect */}
          <motion.div
            className="absolute -inset-[2px] bg-gradient-to-r from-[#FF3B30] via-[#4CC9F0] to-[#FF3B30] opacity-50 blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ zIndex: -1 }}
          />

          <div className="relative p-8">
            {/* Header */}
            <div className="text-center mb-8 pb-6 border-b border-white/10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF3B30] to-[#4CC9F0] rounded-lg flex items-center justify-center">
                  <span className="font-['Bebas_Neue'] text-xl text-black">DTBM</span>
                </div>
                <span className="font-['Bebas_Neue'] text-2xl tracking-wider">Run Club</span>
              </div>
              <div className="inline-block px-4 py-1 bg-[#FF3B30] rounded-full text-xs uppercase tracking-wider">
                Event Ticket
              </div>
            </div>

            {/* Event Info */}
            <div className="space-y-4 mb-8">
              <div>
                <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Event</div>
                <div className="font-['Bebas_Neue'] text-2xl">{eventName}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Runner</div>
                  <div className="font-medium">{runnerName}</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Bib #</div>
                  <div className="font-['Bebas_Neue'] text-3xl text-[#FF3B30]">{bibNumber}</div>
                </div>
              </div>

              <div>
                <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Distance</div>
                <div className="font-medium">{distance}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Date</div>
                  <div className="font-medium text-sm">{date}</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Location</div>
                  <div className="font-medium text-sm">{location}</div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-2xl">
                <QRCodeSVG
                  value={qrPayload}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            {/* Scan Animation */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-[200px] h-0.5 bg-gradient-to-r from-transparent via-[#FF3B30] to-transparent"
              animate={{
                y: [200, 280, 200],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={18} />
                Download
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigator.share?.({ title: 'DTBM Ticket', text: `${eventName} | Bib ${bibNumber}` })}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 size={18} />
                Share
              </motion.button>
            </div>
          </div>

          {/* Tear Perforation Effect */}
          <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-[#0A0A0A]" />
          <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-[#0A0A0A]" />
        </div>
      </motion.div>
    </motion.div>
  );
}
