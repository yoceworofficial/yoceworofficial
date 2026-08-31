/* YOCEWOR — Single Featured Image helper
 * Stores one optional image with each content record and hides the public
 * image container completely when no image is selected.
 */
(function () {
  'use strict';
  window.YOCEWORFeaturedImage = {
    readFile(file) {
      return new Promise((resolve, reject) => {
        if (!file) return resolve('');
        if (!file.type || !file.type.startsWith('image/')) return reject(new Error('Please select an image file.'));
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('Could not read image.'));
        reader.readAsDataURL(file);
      });
    },
    renderPreview(imageUrl, imgEl, wrapperEl) {
      const hasImage = typeof imageUrl === 'string' && imageUrl.length > 0;
      if (imgEl) {
        imgEl.src = hasImage ? imageUrl : '';
        imgEl.hidden = !hasImage;
      }
      if (wrapperEl) wrapperEl.hidden = !hasImage;
    },
    renderPublic(imageUrl, imgEl, wrapperEl) {
      this.renderPreview(imageUrl, imgEl, wrapperEl);
    }
  };
})();
