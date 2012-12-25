Camera.ContrastDetection = {};

/**
 * Calculates a contrastiness metric for the imageData.
 * 
 * @param {Object} imageData Image data to analyse.
 * @return {number} The amount of contrast in the image.
 */
Camera.ContrastDetection.detect = function(imageData) {
    var ar=0, ag=0, ab=0, i=0, n=0, f=0, d=imageData.data, l=0;

    var delta=0, r=0, g=0, b=0, ni=0, m2r=0, m2g=0, m2b=0;
    for (i=0, l=d.length, n=0; i<l; i+=4) {
        r = d[i];
        n++;
        ni = 1/n;
        g = d[i+1];
        b = d[i+2];

        delta = r - ar;
        ar = ar + delta * ni;
        m2r = m2r + delta * (r - ar);

        delta = g - ag;
        ag = ag + delta * ni;
        m2g = m2g + delta * (g - ag);

        delta = b - ab;
        ab = ab + delta * ni;
        m2b = m2b + delta * (b - ab);
    }

    var vr = m2r / (n-1);
    var vg = m2g / (n-1);
    var vb = m2b / (n-1);
    return Math.sqrt(vr*vr + vg*vg + vb*vb);
};

/**
 * Contrast detection autofocus algorithm.
 * 
 * Finds a camera position between 0 and 65535 with the highest contrast.
 * Uses a hill-climb search to find the focus position. Not the fastest
 * thing around.
 * 
 * @param {Object} camera Camera object to use.
 * @return {number} Camera focus position with highest contrast.
 */
Camera.ContrastDetection.autofocus = function(camera) {
    var MIN_POS = 0, MAX_POS = 65535;
    var contrast = 0;
    var beenThere = false;
    var position = camera.focusPosition;
    var dir = 1;
    var speed = 1;

    while (true) {
        var image = camera.getAFImage();
        var newContrast = this.detect(image);
        if (newContrast > contrast) {
            contrast = newContrast;
            position += dir*speed;
            if (position < MIN_POS || position > MAX_POS) {
                return position - dir*speed;
            }
            camera.setFocus(position);
            beenThere = false;
        } else if (beenThere) {
            position -= dir*speed;
            camera.setFocus(position);
            return position;
        } else {
            position -= 2*dir*speed;
            camera.setFocus(position);
            dir *= -1;
            beenThere = true;
        }
    }
};
