// Bootstrap 3 doesn't support UMD properly (BS4 will do though)
global.$ = global.jQuery = require('jquery');
require('bootstrap');
require('flot');

import _ from 'lodash';
import vis from 'vis';
import alertify from 'alertifyjs';
import handlebars from 'handlebars';

import Perceptron from './perceptron';

export default class UI {
    constructor() {
        this.templates = {
            inputImage: handlebars.compile($('#input-image-template').html()),
            trainingSetImage: handlebars.compile($('#training-set-image-template').html()),
            config: handlebars.compile($('#config-template').html())
        };

        this.$config = $('#config');
        this.$log = $('#log');
        this.$inputImage = $('#input-image');
        this.$trainingSet = $('#training-set');
        this.$displayValue = $('.display__value');

        $('#apply').click(this.apply.bind(this));
        $('#train').click(this.train.bind(this));
        $('#reset').click(this.reset.bind(this));

        $('.add-image').click((e) => {
            var label = $(e.target).data('value');
            this.addImage(label);
        });
        $('.clear').click(this.renderInputImage.bind(this));
        $('#recognize').click(this.recognize.bind(this));
        $('#run-tests').click(this.runTests.bind(this));


        $('.nav-tabs a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        });

        this.config = {
            imageSize: 3,
            speed: 0.1,
            threshold: 0.5
        };

        this.renderConfig(this.config);
        this.renderInputImage();
    }

    runTests() {
        var p = new Perceptron(9, 0.5);
        var trainSet = {
            0: [[
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ]],
            1: [[
                0, 0, 1,
                0, 1, 0,
                1, 0, 0
            ]]
        };

        console.log('Test started');
        var result = p.train(trainSet, 0.1);
        console.log('Steps: ' + result.stepsCount);
        console.assert(p.activate(trainSet[0][0]).value == 0);
        console.assert(p.activate(trainSet[1][0]).value == 1);
        console.log('Test finished');
    }

    plot(history) {
        this.$log.empty();

        _.each(history, (neuronHistory, id) => {
            var data = [{
                label: 'w' + id + ' vs step',
                data: neuronHistory
            }];

            var $plot = $('<div />');
            $plot.addClass('plot');
            $plot.appendTo(this.$log);

            $.plot($plot, data, {
                series: {
                    lines: { show: true },
                    points: { show: true }
                },
                grid: {
                    hoverable: true,
                    clickable: true
                },
                xaxis: {
                    label: 'step'
                },
                yaxis: {
                    label: 'w'
                }
            });
        });
    }

    renderInputImage() {
        var image = [];

        for (let i = 0; i < this.config.imageSize; ++i) {
            let row = [];
            for (let j = 0; j < this.config.imageSize; ++j) {
                row.push(0);
            }
            image.push(row);
        }

        var html = this.templates.inputImage(image);
        this.$inputImage.html(html);

        this.$inputImage.find('.cell').each((id, cell) => {
            var $cell = $(cell);
            $cell.click(this.flipCell.bind(this, $cell));
        });
    }

    flipCell($cell) {
        var value = $cell.data('value');
        $cell.removeClass('cell' + value);
        value = +!value;
        $cell.data('value', value);
        $cell.addClass('cell' + value);
    }

    getInputImage($image) {
        var cells = $image.find('.cell');
        return _.map(cells, (cell) => $(cell).data('value'));
    }

    addImage(label) {
        var image = {
            label: label,
            image: _.chunk(this.getInputImage(this.$inputImage), this.config.imageSize)
        };

        var $image = $(this.templates.trainingSetImage(image));
        $image.appendTo(this.$trainingSet);

        $image.find('.remove').click(() => $image.remove());

        // clear input
        this.renderInputImage();
    }

    apply() {
        this.config = this.getConfig();

        this.$trainingSet.empty();
        this.renderInputImage(this.$inputImage);
    }

    train() {
        // collect training set
        var trainingSet = {
            0: [],
            1: []
        };

        this.$trainingSet.find('.sample').each((id, sample) => {
            var $sample = $(sample);
            var label = $sample.data('label');
            var image = this.getInputImage($sample.find('.image-table'));

            trainingSet[label].push(image);
        });

        // get config
        this.config = this.getConfig();

        // train
        this.perceptron = new Perceptron(
            this.config.imageSize * this.config.imageSize,
            this.config.threshold);

        var result = this.perceptron.train(trainingSet, this.config.speed);

        alertify.success('Training finished after ' + result.stepsCount + ' steps');
        this.plot(result.history);
    }

    reset() {
        this.perceptron.reset();
    }

    recognize() {
        var image = this.getInputImage(this.$inputImage);
        var value = this.perceptron.activate(image);
        this.$displayValue.text(value.value + ' (' + value.raw.toFixed(2) + ')');
    }

    renderConfig(config) {
        this.config = config;
        var html = this.templates.config({
            config: config
        });
        this.$config.html(html);
    }

    getConfig() {
        var config = {};

        this.$config.find('input').each((id, input) => {
            var $input = $(input);
            var val = parseFloat($input.val());
            if (_.isNaN(val))
                val = $input.val();

            config[$input.data('key')] = val;
        });

        return config;
    }
}