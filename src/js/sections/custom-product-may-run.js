class SelectVariant extends HTMLElement {
  constructor() {
    super();

    this.product = JSON.parse(document.getElementById('product-data').textContent);
    this.userData = {};
    this.change = new Event('change');

    this.init();
  }

  async init() {

    await this.getCart();
    this.active_variant_id = this.readUrl();

    this.addEventListener('change', () => {
      this.active_variant_id = this.readUrl();
    });

    this.addToCartTriger = document.querySelector('.product-info .custom-add-to-cart');
    this.checkoutTriger = document.querySelector('.custom-checkout');
    this.errorMassage = document.querySelector('.error-message');

    this.userFormTrigger = document.querySelector('#user-information');
    this.userDataform = document.querySelector('.user-information .user-data');
    this.userDataInputs = document.querySelectorAll('.user-information' +
      ' .user-data' +
      ' input')

    this.changeURL(this.active_variant_id);
    this.initVariantSelect(this.active_variant_id);
    this.changeVariant();
    this.initAddToCart();
    this.userDataFormShow();
    this.formValidate();
    this.formChangeUserData()
  }

  formChangeUserData() {
    let uniqueId = new Date().getTime();
    let moreData = true;
    this.userDataInputs.forEach(input => {
      input.addEventListener('input', () => {
        if(input.value !== '') this.userData[`${input.id}`] = input.value;
        else delete this.userData[`${input.id}`];


        this.userData._uniqueId = uniqueId;
        this.userData._moreData = moreData;
        this.formValidate();
      })
    })
  }

  formValidate() {
    this.userDataInputs.forEach(input => {
      if(this.userFormTrigger.checked) {
        if(input.value === '') input.classList.add('error');
        else input.classList.remove('error');
      }

      if(Object.keys(this.userData).length === this.userDataInputs.length + 2) {
        this.addToCartTriger.disabled = false;
        this.checkoutTriger.disabled = false;
        this.changeVariant();
      }
    })
  }

  resetUserData() {
    this.userDataInputs.forEach(input => input.value = '');
    this.userData = {};
  }

  userDataFormShow() {
    if(!this.userFormTrigger) return;
    this.userFormTrigger.addEventListener('change', () => {
      if(this.userFormTrigger.checked) {
        this.addToCartTriger.disabled = true;
        this.checkoutTriger.disabled = true;
        this.userDataform.classList.add('show');
      } else {
        this.userDataform.classList.remove('show');
        this.resetUserData();
        this.formChangeUserData();
        this.changeVariant();
      }

      this.formValidate();
    })
  }

  readUrl() {
    const url = new URL(window.location.href);
    let variantId = url.searchParams.get('variant');

    const productFirsVariant = this.product.variants.find((variant, index) => index === 0 && variant);
    if (!variantId) variantId = productFirsVariant.id;

    return +variantId;
  }

  changeURL(variantId = null) {
    const selected_variant = this.product.variants.find((variant, index) => index === 0 && variant);

    if (!variantId) {
      variantId = selected_variant.id;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('variant', variantId);
    window.history.replaceState({}, '', url);
  }

  initVariantSelect(variantId) {
    let current_variant = this.product.variants.find((variant, index) => index > 1 && variant.id === variantId);

    if (!current_variant) {
      current_variant = this.product.variants.find((variant) => variant.id === variantId);
    }

    const selects = this.querySelectorAll('select');
    selects.forEach((select) => {
      const value = current_variant[`${select.id}`];
      if (value) {
        select.value = value;
      }

      select.dispatchEvent(this.change);
    });

    this.initActiveVariantImage(current_variant.id);
  }

  changeVariant() {
    const selects = this.querySelectorAll('select');

    const pre_variant = {};
    let active_variant = null;
    const selectOrder = Array.from(selects).map((select) => select.id);

    const handleChange = () => {
      selects.forEach((select) => {
        pre_variant[`${select.id}`] = select.value;
      });

      const title = selectOrder.map((id) => pre_variant[id]).join(' / ');
      active_variant = this.product.variants.find((variant, index) => variant.title === title);

      if (active_variant) {
        this.changeURL(active_variant.id);
        this.initActiveVariantImage(active_variant.id);
        this.changeVariantPrice(active_variant.id);
        this.readUrl();
        this.variantAvailable(active_variant);
      }
    };
    handleChange();

    selects.forEach((select) => {
      select.addEventListener('change', handleChange);
    });
  }

  initActiveVariantImage(variantId) {
    if (!variantId) {
      throw new Error('Variant ID is missing');
    }

    let current_variant_media = this.product.variants.find((variant, index) => index > 1 && variant.id === variantId);

    if (!current_variant_media) {
      current_variant_media = this.product.variants.find((variant) => variant.id === variantId);
    }

    const images = document.querySelectorAll('.product-images img');
    images.forEach((img) => {
      img.classList.add('hide');
      if (+img.dataset.id === current_variant_media.featured_media.id) {
        img.classList.remove('hide');
      }
    });
  }

  changeVariantPrice(variantId) {
    const price_box = document.querySelector('.product-info .price');
    const current_variant = this.product.variants.find((variant, index) => variant.id === variantId);
    price_box.textContent = `${removeZero(price_box.dataset.symbol)} ${(current_variant.price / 100).toFixed(2)}`;

    function removeZero(string) {
      return string.replaceAll('0', '');
    }
  }

  initAddToCart() {
    if (this.addToCartTriger) {
      this.addToCartTriger.addEventListener('click', async () => {
        this.addToCartTriger.disabled = true;
        this.checkoutTriger.disabled = true;
        const product_added = await this.addToCart(this.active_variant_id);

        if(product_added) {
          this.addToCartTriger.disabled = false;
          this.checkoutTriger.disabled = false;
        }
      });
    }

    if (this.checkoutTriger) {
      this.checkoutTriger.addEventListener('click', async () => {
        const product_added = await this.addToCart(this.active_variant_id);
        if (product_added && product_added.id) window.location.href = '/checkout';
      });
    }
  }

  updateCartTotal(count) {
    const sup = document.createElement('sup');
    sup.classList.add('text-black');
    sup.textContent = count;
    const cart_count = document.querySelector('.header__icons' + ' a[href="/cart"]');
    const old_sup = cart_count.querySelector('sup');

    if (old_sup) {
      old_sup.replaceWith(sup);
    } else {
      cart_count.prepend(sup);
    }
  }

  variantAvailable(active_variant) {
    if(active_variant.available) {
      this.addToCartTriger.disabled = false;
      this.checkoutTriger.disabled = false;
      this.errorMassage.classList.add('hide');
    } else {
      this.addToCartTriger.disabled = true;
      this.checkoutTriger.disabled = true;
      this.errorMassage.classList.remove('hide');
    }
  }

  async getCart() {
    const url = '/cart.js';
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    };

    try {
      const response = await fetch(url, options);
      const res = await response.json();

      if (res) {
        this.updateCartTotal(res.item_count);
      }

      return res;
    } catch (error) {
      return error;
    }
  }

  async addToCart(variantId) {
    const userDataEnable = Object.keys(this.userData);
    const userData = this.userData;

    if (!variantId) return;
    const url = '/cart/add.js';
    const data = {
      id: variantId,
      quantity: 1,
      properties: userDataEnable.length > 0 ? {...userData} : {},
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };

    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      return error;
    } finally {
      await this.getCart();
    }
  }

  async removeProduct(variantId) {
    if (!variantId) return;
    const url = '/cart/change.js';
    const data = {
      id: variantId,
      quantity: 0,
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };

    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      return error;
    } finally {
      await this.getCart();
    }
  }
}

customElements.define('select-variants', SelectVariant);
