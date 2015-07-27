#!/bin/bash

new_filepath=$filepath_noext-new

if [[ $filepath_noext == *'pa_br_focos_calor_pastagem_50ha_1000'* ]]; then
	log "$filepath_noext"

echo -e '<?xml version="1.0" encoding="UTF-8"?>' \
'\n<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:se="http://www.opengis.net/se">' \
'\n  <NamedLayer>' \
'\n    <se:Name>pa_br_focos_calor_pastagem_50ha_1000_LAPIG</se:Name>' \
'\n    <UserStyle>' \
'\n      <se:Name>pa_br_focos_calor_pastagem_50ha_1000_LAPIG</se:Name>' \
'\n      <se:FeatureTypeStyle>' \
'\n        <se:Rule>' \
'\n          <se:Name>Single symbol</se:Name>' \
'\n             <se:PointSymbolizer>' \
'\n              <se:Graphic>' \
'\n                <se:Mark>' \
'\n                  <se:WellKnownName>circle</se:WellKnownName>' \
'\n                  <se:Fill>' \
'\n                    <se:SvgParameter name="fill">#ffffff</se:SvgParameter>' \
'\n                  </se:Fill>' \
'\n                </se:Mark>' \
'\n                <se:Size>8</se:Size>' \
'\n              </se:Graphic>' \
'\n            </se:PointSymbolizer>' \
'\n            <se:PointSymbolizer>' \
'\n              <se:Graphic>' \
'\n                <se:Mark>' \
'\n                  <se:WellKnownName>circle</se:WellKnownName>' \
'\n                  <se:Fill>' \
'\n                    <se:SvgParameter name="fill">#c71905</se:SvgParameter>' \
'\n                  </se:Fill>' \
'\n                </se:Mark>' \
'\n                <se:Size>4</se:Size>' \
'\n              </se:Graphic>' \
'\n            </se:PointSymbolizer>' \
'\n        </se:Rule>' \
'\n      </se:FeatureTypeStyle>' \
'\n    </UserStyle>' \
'\n  </NamedLayer>' \
'\n</StyledLayerDescriptor>' > $filepath_noext.sld

fi
