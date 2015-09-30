import _ from 'lodash';

export default class Perceptron {
    constructor(inputsCount) {
        this.inputsCount = inputsCount;
        this.reset();
    }

    activate(inputs) {
        var value = 0;

        for (let i = 0; i < inputs.length; ++i) {
            value += inputs[i] * this.weights[i];
        }

        return value > 0.5;
    }

    reset() {
        this.weights = [];
        for (let i = 0; i < this.inputsCount; ++i) {
            this.weights.push(_.random(0, 1, true));
        }
    }

    train(dictionary, speed) {
        var error = 1;
        var stepsCount = 0;

        while (error != 0) {
            _.each(dictionary, (images, label) => {
                _.each(images, (image) => {
                    let result = this.activate(image);
                    error = label - result;

                    this.weights = _.map(this.weights,
                        (w, i) => w + speed * error * image[i]);
                });
            });
            ++stepsCount;
        }

        return stepsCount;
    }
}