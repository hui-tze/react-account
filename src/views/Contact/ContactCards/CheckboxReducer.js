export const reducer = (state, action) => {
    switch (action.type) {
        case 'check1':
            return { ...state, check1: !state.check1 }
        case 'check2':
            return { ...state, check2: !state.check2 }
        case 'check3':
            return { ...state, check3: !state.check3 }
        case 'check4':
            return { ...state, check4: !state.check4 }
        case 'check5':
            return { ...state, check5: !state.check5 }
        case 'check6':
            return { ...state, check6: !state.check6 }
        case 'check7':
            return { ...state, check7: !state.check7 }
        case 'check8':
            return { ...state, check8: !state.check8 }
        case 'check9':
            return { ...state, check9: !state.check9 }
        case 'check10':
            return { ...state, check10: !state.check10 }
        case 'check11':
            return { ...state, check11: !state.check11 }
        case 'check12':
            return { ...state, check12: !state.check12 }
        case 'check13':
            return { ...state, check13: !state.check13 }
        case 'check14':
            return { ...state, check14: !state.check8 }
        case 'check15':
            return { ...state, check15: !state.check15 }
        default:
            return state
    }
}