"use strict"

const req = new Request('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
fetch(req)
   .then(res => res.json())
   .then(res => {
      console.log(res)
      const dataset = res.monthlyVariance
      const h1_h = document.querySelector('#title').offsetHeight
      const pad = 20
      const pad_left = 60
      const w = window.innerWidth - h1_h
      const h = window.innerHeight - h1_h * 3

      const year_min = new Date(d3.min(dataset, d => d.year), 0)
      const year_max = new Date(d3.max(dataset, d => d.year), 0)
      const x_scale = d3.scaleTime([year_min, year_max], [pad_left, w - pad])
      const x_axis = d3.axisBottom(x_scale).tickFormat(d3.timeFormat('%Y'))

      const month_min = new Date(0, d3.min(dataset, d => d.month - 1))
      const month_max = new Date(0, d3.max(dataset, d => d.month - 1))
      const y_scale = d3.scaleTime([month_min, month_max], [h - pad, pad])
      const y_axis = d3.axisLeft(y_scale).tickFormat(d3.timeFormat('%B'))

      let svg = d3.select('body')
         .append('svg')
            .attr('width', w)
            .attr('height', h)

      svg.append('g')
         .attr('id', 'x-axis')
         .attr('transform', `translate(0, ${h - pad})`)
         .call(x_axis)

      svg.append('g')
         .attr('id', 'y-axis')
         .attr('transform', `translate(${pad_left}, 0)`)
         .call(y_axis)

      let tooltip = d3.select('body')
         .append('div')
            .attr('id', 'tooltip')
            .style('visibility', 'hidden')

      const cell_w = Math.floor((w - pad - pad_left) / (dataset.length / 12))
      const cell_h = Math.floor((h - pad * 2) / 12)
      svg.selectAll('rect')
         .data(dataset)
         .enter()
         .append('rect')
            .attr('class', 'cell')
            .attr('x', d => x_scale(new Date(d.year, 0)))
            .attr('data-year', d => d.year)
            .attr('y', d => y_scale(new Date(0, d.month - 1)) - cell_h)
            .attr('data-month', d => d.month - 1)
            .attr('width', cell_w)
            .attr('height', cell_h)
            .attr('data-temp', d => d.variance)
            .attr('fill', d => {
               switch(true) {
                  case (d.variance < -4): return '#00f'
                  case (d.variance < -1): return '#0ff'
                  case (d.variance < 1): return '#0f0'
                  case (d.variance < 4): return '#ff0'
                  case (d.variance < 7): return '#f00'
                  default: return '#000'
               }
            })
            .on('mouseover', d => {
               tooltip.style('visibility', 'visible')
               tooltip.attr('data-year', d.year, 0)
               tooltip.text(`year: ${d.year} month: ${d.month} variance: ${d.variance}`)
            })
            .on('mouseout', () => {
               tooltip.style('visibility', 'hidden')
            })

      console.log(svg.selectAll('rect'))

      const key_w = 40
      const key_h = 20
      let legend = d3.select('body')
         .append('svg')
            .attr('width', key_w * 5)
            .attr('height', key_h)
            .attr('id', 'legend')

      const key_fills = [
         ['#00f', '#fff', '(-7, -4)'],
         ['#0ff', '#000', '(-4, -1)'],
         ['#0f0', '#000', '(-1, 1)'],
         ['#ff0', '#000', '(1, 4)'],
         ['#f00', '#fff', '(4, 7)']]

      legend.selectAll('rect')
         .data(key_fills)
         .enter()
         .append('rect')
            .attr('x', (d, i) => i * key_w)
            .attr('y', 0)
            .attr('width', key_w)
            .attr('height', key_h)
            .attr('fill', d => d[0])

      legend.selectAll('text')
         .data(key_fills)
         .enter()
         .append('text')
            // the math to properly center these is escaping me at the moment
            .attr('x', (d, i) => i * key_w)
            .attr('y', key_h / 2)
            .attr('dx', '0.5em')
            .attr('dy', '0.35em')
            .attr('fill', d => d[1])
            .text(d => d[2])
   })
   