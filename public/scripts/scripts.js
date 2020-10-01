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
  handleFileInput(event) {
    const { files: fileList } = event.target;
    const { preview, getContainer } = PhotosUpload;

    if (PhotosUpload.hasLimit(event)) return;

    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        const image = new Image();
        image.src = String(reader.result);

        const container = getContainer(image);

        preview.appendChild(container);
      };
      reader.readAsDataURL(file);
    });
  },
  hasLimit(event) {
    const { files: fileList } = event.target;
    const { uploadLimit } = PhotosUpload;

    if (fileList.length > uploadLimit) {
      alert(`Envie no máximo ${uploadLimit} fotos`);
      event.preventDefault();
      return true;
    }
    return false;
  },
  getContainer(image) {
    const container = document.createElement("div");

    container.classList.add("photo");

    container.onclick = () => alert("Remover foto!");

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
};
