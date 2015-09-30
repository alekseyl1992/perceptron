// Bootstrap 3 doesn't support UMD properly (BS4 will do though)
global.$ = global.jQuery = require('jquery');
require('bootstrap');

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
            config: handlebars.compile($('#config-template').html()),
            log: handlebars.compile($('#log-template').html())
        };

        this.$config = $('#config');
        this.$log = $('#log');
        this.$start = $('#start');
        this.$stepsCount = $('#stepsCount');

        this.$inputImage = $('#input-image');
        this.$inputLabel = $('#input-label');
        this.$trainingSet = $('#training-set');

        this.$stepsCount.click((e) => false);

        this.$start.click(this.start.bind(this));

        this.$save = $('#save');
        this.$load = $('#load');
        this.$save.click(this.save.bind(this));
        this.$load.click(this.load.bind(this));

        $('.nav-tabs a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        });

        this.imageSize = 3;
        this.defaultConfig = {
            speed: 0.1,
            threshold: 0.5
        };
        this.renderConfig(this.defaultConfig);

        this.renderInputImage();
    }

    start() {
        var config = this.getConfig();
        this.config = _.clone(config);


    }

    save() {

    }

    load() {

    }

    log (population) {
        var html = this.templates.log({
            population: population,
            from: this.config.from,
            to: this.config.to
        });
        this.$log.html(html);
    }

    renderInputImage() {
        var image = [];

        for (let i = 0; i < this.imageSize; ++i) {
            let row = [];
            for (let j = 0; j < this.imageSize; ++j) {
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

    getInputImage() {
        var cells = this.$inputImage.find('.cell');
        return _.map(cells, (cell) => $(cell).data('value'));
    }

    addImage() {
        var image = {
            label: this.$inputLabel.val(),
            image: this.getInputImage()
        };

        var $image = $(this.templates.trainingSetImage(image));
        $image.appendTo(this.$trainingSet);
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