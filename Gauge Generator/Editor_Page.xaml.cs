using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace Gauge_Generator
{
    /// <summary>
    /// Interaction logic for Editor_Page.xaml
    /// </summary>
    public partial class Editor_Page : Page
    {
        public Editor_Page()
        {
            InitializeComponent();
            if (Global.EditingLayer == null)
            {
                Global.SetSidebar(Global.SidebarPages.Layers);
            }
            else
            {
                prop_grid.SelectedObject = Global.EditingLayer;
            }
            Global.RefreshScreen();
        }

        private void Close_btn(object sender, RoutedEventArgs e)
        {
            foreach(Layer i in Global.project.layers)
            {
                if (i.RangeSource == Global.EditingLayer) i.ValidateWithSource();
            }
            Global.EditingLayer = null;
            Global.SetSidebar(Global.SidebarPages.Layers);
        }

        private void Prop_grid_PropertyValueChanged(object sender, Xceed.Wpf.Toolkit.PropertyGrid.PropertyValueChangedEventArgs e)
        {
            Global.RefreshScreen();
        }
    }
}
