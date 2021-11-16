$(document).ready(function () {

    let
        sensors = [],
        args = [],
        values = [],
        xMin = 0,
        xMax = 1,
        yMin = 0,
        yMax = 1,
        xAxis = [],
        container = $("main").get(0),
        $filename = $("input#filename"),
        $slider = $("input#slider"),
        layout = {
            title: "Interpolation",
            xaxis: {
                text: "dist",
                range: [xMin, xMax],
                autorange: false
            },
            yaxis: {
                text: "temp",
                range: [yMin, yMax],
                autorange: false
            }
        },
        cubicSpline = null,
        higherSpline = null,
        data = null,
        lastIndex = 0,
        loop = null,
        paused = false;

    Plotly.newPlot(
        container,
        [],
        layout,
        { displayModeBar: false }
    );

    $filename.change(function (e) {
        e.preventDefault();

        Papa.parse(this.files[0], {
            download: true,
            complete: loadGraph,
            error: console.error,
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            transform: value => value.replace(",", ".")
        });
    });

    $slider
        .mouseenter(function () {
            paused = true;
        })
        .mouseleave(function () {
            paused = false;
        })
        .change(function (e) {
            e.preventDefault();
            let index = parseInt($(this).val());
            displayData(index);
        });

    $(container)
        .mouseenter(function () {
            paused = true;
        })
        .mouseleave(function () {
            paused = false;
        });

    function loadGraph(csv, file) {

        if (loop) {
            window.cancelAnimationFrame(loop);
        }

        sensors = [];
        args = [];
        values = [];
        xMin = 0;
        xMax = -2.5;
        yMin = 0;
        yMax = 1;
        xAxis = [];
        data = csv.data;
        lastIndex = 0;
        paused = false;

        $slider
            .attr("max", csv.data.length)
            .val(0);

        for (let heading of csv.meta.fields) {
            if (heading.startsWith("sens") && !sensors.includes(heading)) {
                sensors.push(heading);
                xMax += 2.5;
                args.push(xMax);
                values.push(data[0][heading]);
            }
        }

        data.forEach(row => {
            yMax = Math.max(yMax, row.reftemp);
            sensors.forEach(heading => {
                yMax = Math.max(yMax, row[heading]);
            });
        });

        layout = {
            title: "Time = 0",
            xaxis: {
                text: "dist",
                range: [xMin, xMax],
                autorange: false
            },
            yaxis: {
                text: "temp",
                range: [yMin, yMax],
                autorange: false
            }
        };

        cubicSpline = Spline(args, args.map(val => 0), [0, 0]);
        higherSpline = Spline(args, args.map(val => 0), [0, 0], [0, 0]);

        for (let x = 0; x <= xMax; x += 0.1) {
            xAxis.push(x);
        }

        loop = window.requestAnimationFrame(function nextFrame() {
            loop = window.requestAnimationFrame(nextFrame);
            if (paused) return;
            let index = lastIndex + 1;
            if (index >= data.length) return;
            $slider.val(index).change();
        });

    } // function loadGraph(csv) { ... }

    function displayData(index) {

        if (index > data.length) return;

        let row = data[index];
        values = sensors.map(sens => row[sens]);

        let cubicInterpl = cubicSpline.update(values);
        let higherInterpl = higherSpline.update(values);

        layout.title = "Time = " + row.Time;
        $slider.attr("title", row.Time);

        Plotly.react(container, [
            {
                name: "sensors",
                mode: "markers",
                x: args,
                y: values
            },
            {
                name: "cubic interpl",
                mode: "lines",
                x: xAxis,
                y: xAxis.map(cubicInterpl)
            },
            {
                name: "higher interpl",
                mode: "lines",
                x: xAxis,
                y: xAxis.map(higherInterpl)
            }, {
                name: "reftemp",
                mode: "lines",
                x: [xMin, xMax],
                y: [row.reftemp, row.reftemp]
            }
        ], layout);

        lastIndex = index;

    } // function displayData(index) { ... }

}); // $(document).ready( ... );