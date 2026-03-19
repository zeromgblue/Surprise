import { TEMPLATES_1 } from './templates-data-1.js';
import { TEMPLATES_2 } from './templates-data-2.js';
import { TEMPLATES_3 } from './templates-data-3.js';

// รวมเทมเพลตทั้ง 3 แพ็กเกจ เพื่อให้ใช้งานได้ทั้งหมด (132 เทมเพลต)
export const TEMPLATES = [...TEMPLATES_1, ...TEMPLATES_2, ...TEMPLATES_3];

export const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'love', label: 'ความรัก' },
  { id: 'birthday', label: 'วันเกิด' },
  { id: 'friendship', label: 'มิตรภาพ' },
  { id: 'occasion', label: 'โอกาสพิเศษ' },
  { id: 'feelings', label: 'ความรู้สึก' },
  { id: 'motivation', label: 'แรงบันดาลใจ' },
  { id: 'daily', label: 'ชีวิตประจำวัน' },
  
  // Premium 120฿ Categories
  { id: 'space', label: '🪐 อวกาศและไซไฟ' },
  { id: 'fantasy', label: '🏰 แฟนตาซีเวทมนตร์' },
  { id: 'minigame', label: '🕹️ มินิเกมอินเทอร์แอคทีฟ' },
  { id: 'movie', label: '🍿 ประสบการณ์ภาพยนตร์' },
  { id: 'photoreal', label: 'สามมิติสมจริง' },
  { id: 'nature', label: 'พลังธรรมชาติอลังการ' },
  { id: 'landmark', label: '🗽 แลนด์มาร์คสำคัญ' },
  { id: 'fluid', label: 'ศิลปะวิจิตร Fluid' },
  { id: 'holiday3d', label: 'เทศกาลสุดยอด 3D' },
  { id: 'luxury', label: 'หรูหรา V.I.P Showcase' }
];

export function getTemplateById(id) {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}
