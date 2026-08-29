

/**
 * @param {File} file
 * @returns {Promise<string>} data:image/...;base64,... — يبقى صالح بعد أي reload
 */
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}