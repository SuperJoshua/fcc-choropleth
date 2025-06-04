"use strict";

(async function funk() {
   const education_data = await d3.json('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json')
   const county_data = await d3.json('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json')

   const width = window.innerWidth
   const height = Math.floor(window.innerHeight * 0.7)
   const legend_width = Math.floor(width / 3)

   const color_key = d3.scaleThreshold()
      .domain([10, 20, 30, 40, 50, 60, 70])
      .range(d3.schemePuRd[8])

   const legend_scale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, legend_width])

   let legend = d3.select('#legend')
      .attr('width', legend_width)
      .attr('height', 20)

   let legend_axis = legend.append('g')
      .attr('transform', 'translate(0, 2)')
   legend_axis.selectAll('rect')
      .data(color_key.range().map(d => {
         d = color_key.invertExtent(d)
         if (d[0] == null) d[0] = legend_scale.domain()[0]
         if (d[1] == null) d[1] = legend_scale.domain()[1]
         return d
      }))
      .enter().append('rect')
         .attr('x', d => legend_scale(d[0]))
         .attr('y', 0)
         .attr('width', d => legend_scale(d[1]) - legend_scale(d[0]))
         .attr('height', 8)
         .attr('fill', d => color_key(d[0]))
   legend_axis.call(d3.axisBottom(legend_scale)
         .tickValues(color_key.domain()))

   let tooltip = d3.select('#tooltip')

   let path = d3.geoPath()

   let chart = d3.select('#chart')
   chart.append('g')
      .selectAll('path')
      .data(topojson.feature(county_data, county_data.objects.counties).features)
      .enter().append('path')
         .attr('class', 'county')
         .attr('data-fips', d => d.id)
         .attr('data-education', d => {
            let res = education_data.filter(o => o.fips == d.id)
            return res[0].bachelorsOrHigher
         })
         .attr('fill', d => {
            let res = education_data.filter(o => o.fips == d.id)
            return color_key(res[0].bachelorsOrHigher)
         })
         .attr('d', path)
         .on('mouseover', d => {
            tooltip.style('visibility', 'visible')
            tooltip.attr('data-education', () => {
               let res = education_data.filter(o => o.fips == d.id)
               return res[0].bachelorsOrHigher
            })
            tooltip.text(() => {
               let res = education_data.filter(o => o.fips == d.id)
               return `${res[0].state} | ${res[0].area_name} | bachelor's degree or greater: ${res[0].bachelorsOrHigher}%`
            })
         })
         .on('mouseout', () => {
            tooltip.style('visibility', 'hidden')
         })

   chart.append('path')
      .datum(topojson.feature(county_data, county_data.objects.states), (a, b) => a !== b)
      .attr('fill', 'none')
      .attr('stroke', '#fff')
      .attr('d', path)

})()