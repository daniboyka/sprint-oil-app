import jsPDF from 'jspdf';
import { supabase } from '../lib/Supabase.jsx'; // Asegurate de que la ruta a tu cliente de supabase sea correcta

export const generarInformePDF = async (turno) => {
  const doc = new jsPDF();
  const logoUrl = '/img/logo.jpg';

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = logoUrl;

    img.onload = async () => {
      try {
        // --- DISEÑO DEL PDF (Lo que ya te gustaba) ---
        doc.setFillColor(26, 26, 26);
        doc.rect(0, 0, 210, 45, 'F');
        doc.addImage(img, 'JPEG', 12, 5, 35, 35); 
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(28);
        doc.setFont("helvetica", "bold");
        doc.text("SPRINT OIL", 55, 25);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text("INFORME TÉCNICO DE SERVICIO", 55, 33);

        // --- DATOS ---
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.text(`Cliente: ${turno.customer}`, 20, 70);
        doc.text(`Vehículo: ${turno.vehicle}`, 20, 77);
        doc.text(`Patente: ${turno.patent}`, 20, 84);
        
        doc.setFont("helvetica", "bold");
        doc.text("OBSERVACIONES TÉCNICAS:", 20, 100);
        doc.setFont("helvetica", "italic");
        const textoObs = turno.observations || "Sin notas adicionales.";
        doc.text(doc.splitTextToSize(textoObs, 170), 20, 108);

        // --- SUBIDA A SUPABASE STORAGE ---
        const pdfBlob = doc.output('blob');
        const fileName = `informe_${turno.patent}_${Date.now()}.pdf`;

        const { data, error } = await supabase.storage
          .from('informes')
          .upload(fileName, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (error) throw error;

        // --- OBTENER URL PÚBLICA ---
        const { data: { publicUrl } } = supabase.storage
          .from('informes')
          .getPublicUrl(fileName);

        // Descarga local por las dudas
        doc.save(fileName);
        
        resolve(publicUrl); // Devolvemos el link para WhatsApp
      } catch (err) {
        console.error("Error completo:", err);
        reject(err);
      }
    };
  });
};