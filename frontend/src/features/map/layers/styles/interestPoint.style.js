import { THEME } from '@mtes-mct/monitor-ui'
import { Icon, Style } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

import { InterestPointLine } from '../../../../domain/entities/interestPointLine'
import { INTEREST_POINT_STYLE, interestPointType } from '../../../../domain/entities/interestPoints'

const interestPointStylesCache = new Map()

const lineStyle = new Style({
  stroke: new Stroke({
    color: THEME.color.slateGray,
    lineDash: [4, 4],
    width: 2
  })
})

export const getInterestPointStyle = (feature, resolution) => {
  const type = feature.get(InterestPointLine.typeProperty)

  if (feature?.getId()?.toString()?.includes('line')) {
    return [lineStyle]
  }

  if (!interestPointStylesCache.has(type)) {
    const filename = getFilename(type)

    const style = new Style({
      image: new Icon({
        imgSize: [30, 79],
        offset: [0, 0],
        src: filename
      }),
      zIndex: INTEREST_POINT_STYLE
    })

    interestPointStylesCache.set(type, [style])
  }

  const style = interestPointStylesCache.get(type)
  style[0].getImage().setScale(1 / resolution ** (1 / 8) + 0.3)

  return style
}

const getFilename = type => {
  switch (type) {
    case interestPointType.CONTROL_ENTITY:
      return 'Point_interet_feature_moyen.png'
    case interestPointType.FISHING_VESSEL:
      return 'Point_interet_feature_navire.png'
    case interestPointType.OTHER:
    default:
      return 'Point_interet_feature_autre.png'
  }
}

export const POIStyle = new Style({
  image: new CircleStyle({
    fill: new Fill({
      color: THEME.color.slateGray
    }),
    radius: 2,
    stroke: new Stroke({
      color: THEME.color.slateGray
    })
  }),
  stroke: new Stroke({
    color: THEME.color.slateGray,
    lineDash: [4, 4],
    width: 2
  })
})
