const Mask = {
  apply(input, func) {
    setTimeout(function () {
      input.value = Mask[func](input.value);
    }, 1);
  },
  formatBRL(value) {
    value = value.replace(/\D/g, "");

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  },
};

const PhotosUpload = {
  preview: document.querySelector(".photos-preview"),
  uploadLimit: 6,
  files: [],
  input: "",
  handleFileInput(event) {
    PhotosUpload.input = event.target;
    const { files: fileList } = event.target;
    const { loadPhotoDiv } = PhotosUpload;

    console.log(event.target.files);

    if (PhotosUpload.hasLimit(event)) return;

    loadPhotoDiv(fileList);

    event.target.files = PhotosUpload.getAllFiles();
  },
  loadPhotoDiv(list) {
    const { createContainerForImage } = PhotosUpload;

    Array.from(list).forEach((file) => {
      PhotosUpload.files.push(file);

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        createContainerForImage(reader.result);
      };
    });
  },

  createContainerForImage(readerResult) {
    const { getContainer, preview } = PhotosUpload;
    const image = new Image();
    image.src = String(readerResult);

    const container = getContainer(image);

    preview.appendChild(container);
  },
  hasLimit(event) {
    const { uploadLimit, files, input } = PhotosUpload;

    const totalFiles = files.length + input.files.length;

    if (totalFiles > uploadLimit) {
      alert(`Envie no máximo ${uploadLimit} fotos`);
      event.preventDefault();
      return true;
    }
    return false;
  },

  getContainer(image) {
    const container = document.createElement("div");

    container.classList.add("photo");

    container.onclick = PhotosUpload.removeImage;

    container.appendChild(image);

    container.appendChild(PhotosUpload.getCloseButton());

    return container;
  },

  getCloseButton() {
    const button = document.createElement("i");

    button.classList.add("material-icons");
    button.innerHTML = "close";

    return button;
  },
  getAllFiles() {
    const dataTransfer =
      new ClipboardEvent("").clipboardData || new DataTransfer();

    PhotosUpload.files.forEach((file) => dataTransfer.items.add(file));

    return dataTransfer.files;
  },

  removeImage(event) {
    const photosDiv = event.target.parentNode;

    const photosListEl = document.querySelectorAll(".photo");

    const index = Array.from(photosListEl).indexOf(photosDiv);

    PhotosUpload.files.splice(index, 1);

    PhotosUpload.input.files = PhotosUpload.getAllFiles();

    photosDiv.remove();
  },
};
