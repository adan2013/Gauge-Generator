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
using System.Windows.Shapes;

namespace Gauge_Generator
{
    /// <summary>
    /// Interaction logic for CloneWindow.xaml
    /// </summary>
    public partial class CloneWindow : Window
    {
        const string ERR_NAME = "Layer must have a name!";

        int _layerindex = -1;
        public int LayerIndex
        {
            get { return _layerindex; }
            set
            {
                _layerindex = value;
                RefreshInformation();
            }
        }

        public CloneWindow()
        {
            InitializeComponent();
            lbl_err_name.Content = "";
            txt_name.Text = "New Layer";
            txt_name.Focus();
            txt_name.SelectionStart = 0;
            txt_name.SelectionLength = txt_name.Text.Length;
        }

        private void RefreshInformation()
        {
            if (LayerIndex >= 0)
            {
                Layer l = Global.project.layers[LayerIndex];
                lbl_description.Text = "Name: " + l.Label + "\nType: " + Global.LayerNames[(int)Global.GetLayerType(l)];
                txt_name.Text = l.Label + "_Clone";
                txt_name.Focus();
                txt_name.SelectionStart = 0;
                txt_name.SelectionLength = txt_name.Text.Length;
            }
        }

        private void Cancel_btn(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
        }

        private void Ok_btn_Click(object sender, RoutedEventArgs e)
        {
            if (LayerIndex < 0) return;
            Layer l = Global.project.layers[LayerIndex];
            Global.LayersType t = Global.GetLayerType(l);
            Layer newItem = (Layer)Activator.CreateInstance(Global.GetLayerObject(t));
            newItem.CloneCreator(l, txt_name.Text);
            Global.project.layers.Insert(LayerIndex, newItem);
            DialogResult = true;
        }

        private void ValidateOperation()
        {
            bool approved = true;
            lbl_err_name.Content = "";
            if (txt_name.Text.Length == 0)
            {
                lbl_err_name.Content = ERR_NAME;
                approved = false;
            }
            ok_btn.IsEnabled = approved;
        }

        private void Txt_name_TextChanged(object sender, TextChangedEventArgs e)
        {
            ValidateOperation();
        }

        private void Txt_name_KeyUp(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter && ok_btn.IsEnabled) Ok_btn_Click(ok_btn, new RoutedEventArgs());
        }
    }
}
