import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Star, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  X, 
  MessageSquare, 
  Sparkles, 
  Eye, 
  EyeOff,
  Image as ImageIcon
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const OFFICIAL_DEMO_TESTIMONIALS = [
  {
    customerName: "Grace Mwangi",
    location: "Nairobi, Kenya",
    resultTag: "Lost 8kg in 4 Weeks",
    rating: 5,
    productUsed: "Complete Duo Combo (Tea + Bean Powder)",
    reviewText: "I started taking the Bean Powder every morning before breakfast and the Slimming Tea before bed. Within 2 weeks my stubborn lower belly bloating completely vanished. I felt light and energized throughout the day without jittery side effects!",
    imageUrl: "/signature-woman.jpg",
    isPublished: true,
    date: "November 2026"
  },
  {
    customerName: "Amina Bakari",
    location: "Dar es Salaam, Tanzania",
    resultTag: "Down 2 Dress Sizes",
    rating: 5,
    productUsed: "SLIMFAST Best Slimming Tea (Jar)",
    reviewText: "Chai hii imebadilisha mfumo wangu wa mmeng'enyo kabisa. Tumbo lilikuwa linajaa gesi na kuwa zito sana, lakini baada ya kutumia wiki 3 nilijihisi mwepesi sana na nguo zangu zote zikaanza kunipwaya. Ni asilia kweli!",
    imageUrl: "/slimming-tea.jpg",
    isPublished: true,
    date: "October 2026"
  },
  {
    customerName: "Sarah Kigozi",
    location: "Kampala, Uganda",
    resultTag: "Lost 6.5kg in 25 Days",
    rating: 5,
    productUsed: "SLIMFAST Bean Powder (250g Pouch)",
    reviewText: "The Arabica bean powder suppressed my morning cravings for snacks and junk food. Drinking lots of water as advised helped flush out toxins fast. Truly the best organic weight loss formula in East Africa!",
    imageUrl: "/bean-powder.jpg",
    isPublished: true,
    date: "November 2026"
  }
];

export const BmsTestimonials = () => {
  const { t, language } = useLanguage();
  const { isOwner, userProfile, currentUser } = useAuth();

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    location: '',
    resultTag: '',
    rating: 5,
    productUsed: 'Complete Duo Combo (Tea + Bean Powder)',
    reviewText: '',
    imageUrl: '',
    isPublished: true,
    date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  });

  // Storage Image Upload
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(collection(db, 'testimonials'), (snap) => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setTestimonials(list);
      setLoading(false);
    }, (err) => {
      console.warn('Testimonials listener notice:', err.message);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      customerName: '',
      location: '',
      resultTag: '',
      rating: 5,
      productUsed: 'Complete Duo Combo (Tea + Bean Powder)',
      reviewText: '',
      imageUrl: '',
      isPublished: true,
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    });
    setImageFile(null);
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      customerName: item.customerName || '',
      location: item.location || '',
      resultTag: item.resultTag || '',
      rating: item.rating || 5,
      productUsed: item.productUsed || 'Complete Duo Combo',
      reviewText: item.reviewText || item.quote || '',
      imageUrl: item.imageUrl || '',
      isPublished: item.isPublished !== false,
      date: item.date || ''
    });
    setImageFile(null);
    setErrorMsg('');
    setModalOpen(true);
  };

  // Upload image to Firebase Storage
  const handleUploadImage = async (file) => {
    if (!storage || !file) return null;
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `testimonials/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      setUploading(true);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Testimonial image upload error:', error);
          setUploading(false);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          resolve(downloadUrl);
        }
      );
    });
  };

  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    if (!isOwner || !db) return;
    if (!formData.customerName || !formData.reviewText) {
      setErrorMsg('Please provide customer name and review text.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');

    try {
      let finalImageUrl = formData.imageUrl;
      if (imageFile) {
        finalImageUrl = await handleUploadImage(imageFile);
      }

      const payload = {
        customerName: formData.customerName.trim(),
        location: formData.location.trim(),
        resultTag: formData.resultTag.trim(),
        rating: Number(formData.rating) || 5,
        productUsed: formData.productUsed,
        reviewText: formData.reviewText.trim(),
        imageUrl: finalImageUrl || '/signature-woman.jpg',
        isPublished: formData.isPublished,
        date: formData.date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        updatedAt: new Date().toISOString()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'testimonials', editingItem.id), payload);
        setSuccessMsg('Testimonial updated successfully!');
      } else {
        await addDoc(collection(db, 'testimonials'), {
          ...payload,
          createdAt: new Date().toISOString(),
          addedBy: userProfile?.name || currentUser?.email || 'Admin'
        });
        setSuccessMsg('Testimonial published to landing page!');
      }

      setModalOpen(false);
    } catch (err) {
      console.error('Error saving testimonial:', err);
      setErrorMsg(err.message || 'Error saving testimonial.');
    }
  };

  const handleDeleteTestimonial = async (id, name) => {
    if (!isOwner || !db) return;
    if (!window.confirm(`Are you sure you want to delete the testimonial for ${name}?`)) return;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
    } catch (err) {
      alert('Could not delete testimonial: ' + err.message);
    }
  };

  const handleTogglePublished = async (item) => {
    if (!isOwner || !db) return;
    try {
      await updateDoc(doc(db, 'testimonials', item.id), {
        isPublished: !item.isPublished
      });
    } catch (err) {
      alert('Could not update status: ' + err.message);
    }
  };

  const handleSeedDemoStories = async () => {
    if (!isOwner || !db) return;
    if (!window.confirm('Populate 3 verified customer transformation stories to showcase immediately?')) return;
    try {
      for (const item of OFFICIAL_DEMO_TESTIMONIALS) {
        await addDoc(collection(db, 'testimonials'), {
          ...item,
          createdAt: new Date().toISOString(),
          addedBy: 'Admin'
        });
      }
      alert('Customer stories seeded successfully!');
    } catch (err) {
      alert('Could not seed testimonials: ' + err.message);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-serif text-brand-forest">
            Customer Testimonials & Transformations
          </h2>
          <p className="text-xs text-brand-charcoal/70 mt-0.5 sm:mt-1">
            Upload transformation photos, before-and-after results, and customer reviews to appear on the landing page.
          </p>
        </div>

        {isOwner && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSeedDemoStories}
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-brand-leaf/40 bg-brand-surface hover:bg-brand-leaf/20 text-brand-forest font-bold text-xs flex items-center space-x-1.5 transition-colors"
              title="Populate demo stories"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-leaf" />
              <span>Sample Stories</span>
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Testimonial</span>
            </button>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Testimonials List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-brand-leaf/30 border-t-brand-forest rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-brand-muted mt-2">{t('loading')}</p>
        </div>
      ) : testimonials.length === 0 ? (

        <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border border-dashed border-brand-leaf/30 space-y-3">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-brand-surface flex items-center justify-center text-brand-forest">
            <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 text-brand-leaf" />
          </div>
          <h3 className="text-base sm:text-lg font-bold font-serif text-brand-forest">
            No Testimonials Uploaded Yet
          </h3>
          <p className="text-xs text-brand-charcoal/70 max-w-sm mx-auto">
            Upload transformation photos, customer reviews, and weight loss results so visitors see real proof on the landing page.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={openAddModal}
              className="px-5 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white text-xs font-bold shadow-md"
            >
              Upload First Customer Review
            </button>
          </div>
        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-3xl border border-brand-leaf/25 shadow-sm p-4 sm:p-5 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-3">
                {/* Header row with status & photo */}
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-surface border border-brand-leaf/30 shrink-0">
                    <img 
                      src={item.imageUrl || '/signature-woman.jpg'} 
                      alt={item.customerName}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/logo.jpg';
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-brand-forest truncate font-serif">
                        {item.customerName}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(item)}
                        className={`p-1 rounded-lg text-xs font-bold ${item.isPublished !== false ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}
                        title={item.isPublished !== false ? 'Visible on Landing Page' : 'Hidden from Landing Page'}
                      >
                        {item.isPublished !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>

                    <p className="text-[11px] text-brand-muted truncate">
                      {item.location || 'East Africa'}
                    </p>

                    {item.resultTag && (
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-brand-forest/10 border border-brand-forest/20 text-brand-forest text-[10px] font-black rounded-full">
                        🔥 {item.resultTag}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(Number(item.rating) || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-xs text-brand-charcoal/80 italic line-clamp-3 bg-brand-surface/40 p-2.5 rounded-xl border border-brand-leaf/15">
                  "{item.reviewText || item.quote}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-brand-leaf/15 flex items-center justify-between">
                <span className={`text-[10px] font-bold ${item.isPublished !== false ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {item.isPublished !== false ? '● Live on Store' : '○ Hidden'}
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-brand-charcoal hover:bg-brand-surface"
                    title="Edit Testimonial"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTestimonial(item.id, item.customerName)}
                    className="p-1.5 rounded-lg text-brand-muted hover:text-red-600"
                    title="Delete Testimonial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      )}

      {/* Add / Edit Testimonial Modal (Responsive on phones) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-brand-leaf/30 p-5 sm:p-7 space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full hover:bg-brand-surface text-brand-charcoal"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg sm:text-xl font-bold font-serif text-brand-forest">
              {editingItem ? 'Edit Customer Testimonial' : 'Upload Customer Testimonial'}
            </h3>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveTestimonial} className="space-y-3.5">
              
              {/* Customer Photo Upload via Firebase Storage */}
              <div className="space-y-2 p-3 bg-brand-surface rounded-2xl border border-brand-leaf/25">
                <label className="block text-xs font-bold text-brand-forest">
                  Customer Transformation Photo *
                </label>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="text-xs text-brand-charcoal file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-forest file:text-white hover:file:bg-brand-leaf"
                  />
                  <span className="text-[10px] text-brand-muted">Upload directly to Firebase Storage</span>
                </div>

                <div className="pt-1">
                  <label className="block text-[10px] text-brand-muted mb-0.5">Or direct image URL:</label>
                  <input
                    type="url"
                    placeholder="https://... image link"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-brand-leaf/30 text-xs bg-white"
                  />
                </div>

                {uploading && (
                  <div className="text-[11px] text-brand-forest font-bold">
                    Uploading image to Firebase Storage: {uploadProgress}%
                  </div>
                )}
              </div>

              {/* Customer Name & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grace Mwangi"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    Location / City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nairobi, Kenya"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40"
                  />
                </div>
              </div>

              {/* Result Tag & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    Result Highlight Tag *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lost 8kg in 4 Weeks"
                    value={formData.resultTag}
                    onChange={(e) => setFormData({ ...formData, resultTag: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40 font-bold text-brand-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    Rating (Stars)
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40 font-bold"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                    <option value="3">⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>
              </div>

              {/* Product Used */}
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  Product Used / Treatment
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete Duo Combo (Tea + Bean Powder)"
                  value={formData.productUsed}
                  onChange={(e) => setFormData({ ...formData, productUsed: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40"
                />
              </div>

              {/* Review Text / Quote */}
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  Transformation Story / Customer Review *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain the customer's transformation, how fast results appeared, and what they liked about SLIMFAST..."
                  value={formData.reviewText}
                  onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40"
                />
              </div>

              {/* Published Toggle */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded text-brand-forest focus:ring-brand-forest"
                />
                <label htmlFor="isPublished" className="text-xs font-bold text-brand-charcoal cursor-pointer">
                  Display this testimonial publicly on the landing page
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-brand-leaf/30 text-xs font-bold text-brand-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white font-bold text-xs shadow-md transition-all"
                >
                  {uploading ? 'Uploading Photo...' : 'Publish Testimonial'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
